const express = require('express')
const Job = require('../models/job')
const Memo = require('../models/memo')

const router = express.Router()

router.use((req, res, next) => {
	if (req.session.loggedIn) {
		next()
	} else {
		res.redirect('/auth/login')
	}
})

router.get('/', (req, res) => {
	// ternary operator changing any previous checked boxes to false/off
	req.body.checked = req.body.checked === true ? false : false
	// Getting all jobs
	Job.find({})
		.populate('owner')
		.then(jobs => {
			const { username, userId, loggedIn } = req.session
			// Updating all checkboxes to set them to false
			Job.updateMany({jobs}, req.body,{ new: true })
				.then((job) => {
				res.render('index', { jobs, username, loggedIn, userId })
		})
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/new', (req, res) => {
    const { username, userId, loggedIn } = req.session
	// First finding the owner or user loggedin
	Job.find({ owner: userId})
		.then(jobs => {
			// then rendering a create page with the user info passed 
			res.render('create.liquid', { jobs, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


router.put('/checked/:id', (req, res) => {
	const jobId = req.params.id
	// getting the specific job by its id
	req.body.checked = req.body.checked === 'on' ? true : false
	// ternary to check a specific job and turn it on
	Job.findByIdAndUpdate(jobId, req.body,{ new: true })
	// find the specific checked job and update it to have a true value for being checked
		.then((job) => {
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})


router.put('/checked', (req, res) => {
	const { username, userId, loggedIn } = req.session
	req.body.checked = req.body.checked === false ? false : true
	// Changes all checkboxes to true and on 
	Job.updateMany({}, req.body,{ new: true })
	// then updates all jobs in the db to be true for being checked
		.then((job) => {
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})


router.put('/unchecked', (req, res) => {
	req.body.checked = req.body.checked === true ? false : false
	// Changes all checkboxes to false and off
	Job.updateMany({}, req.body,{ new: true })
		// then updates all jobs in the db to be unchecked
		.then((job) => {
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})

router.post('/new', (req,res)=> {
	// const { username, userId, loggedIn } = req.session
	req.body.checked = req.body.checked === 'on' ? true : false
	req.body.owner = req.session.userId
	// Assins Owner/User to the new Job Created
	Job.create(req.body)
	// creates a new job with the user information 
		.then(() => {
			res.redirect('/jobs/new')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.post('/creatememo/', (req, res) => {
	const { username, userId, loggedIn } = req.session
	Job.find({checked: true}).lean()
	// Find all jobs that are checked and turn them into plain objects to be safe with lean()
	.populate('owner')
	.then(jobs => {
	// then create a Memo with all the jobs that are checked
		 Memo.create({job: jobs})
			.then(memo => {
			// save this memo
			return memo.save()
			})
			.then(memos => {
				const { username, userId, loggedIn } = req.session
			
				let newArr = []
				memos.job.map((jobs) => newArr.push(jobs))
				// map through the jobs in the memo array and push them into a new array
				let stoneSum = 0
				newArr.map((jobs) => (stoneSum += jobs.stones))
				stoneSum = stoneSum * .50
				// map through the array of jobs and add stones together and multiple them by .50
				let sumQuantity = 0
				newArr.map((jobs) => sumQuantity += jobs.quantity)
				// map through the array of jobs and add the quantity together
				let stonesQuantity = 0
				newArr.map((jobs) => stonesQuantity += jobs.stones)
				// map through the array of jobs and add the stones together 
				res.redirect(`memos/${memos._id}`)
			})
	}) 
			.catch((err) => {
				console.log(err)
				res.redirect('/nojobsselected')
				res.json({ err })
				})
	})


router.get('/memos/:id', (req, res) => {
	const memoId = req.params.id
	Memo.findById(memoId)
		.populate('owner')
		.populate('job')
		.then((memos) => {
			const { username, userId, loggedIn } = req.session
			let newArr = []
			memos.job.map((jobs) => newArr.push(jobs))
			// map through the jobs in the memo array and push them into a new array
			let stoneSum = 0
			newArr.map((jobs) => (stoneSum += jobs.stones))
			stoneSum = stoneSum * .50
			// map through the array of jobs and add stones together and multiple them by .50	
			let sumQuantity = 0
			newArr.map((jobs) => sumQuantity += jobs.quantity)
			// map through the array of jobs and add the quantity together
			let stonesQuantity = 0
			newArr.map((jobs) => stonesQuantity += jobs.stones)
			// map through the array of jobs and add the stones together 
			// render the view page with data passed in
			res.render('memos/printmemo.liquid', { memos, newArr, stoneSum, sumQuantity, stonesQuantity, username, loggedIn, userId })
		})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})
	

router.get('/show', (req, res) => {
	// the show route is used to filter through all the jobs 
	// Use req.query to get the data the user is using to filter
	let order = req.query.order_number;
	let sku = req.query.sku;
	let setter = req.query.setter
	let date = req.query.date
	req.body.checked = req.body.checked === false ? false : true
	// Using an OR operator to return any of the values that match the users search 
	Job.find({ 
		$or: [
		{order_number: order, sku: sku, setter: setter, date: date}, 
		{order_number: order, sku: sku, date: date}, 
		{order_number: order, sku: sku},
		{order_number: order, date: date},
		{order_number: order, setter: setter, date: date},
		{order_number: order, setter: setter},
		{date: date, setter: setter},
		{sku: sku, date: date},
		{sku: sku, setter: setter},
		{setter: setter},
		{sku: sku},
		{order_number: order},
		{date: date}
	]
})
	.populate('owner')
		.then((jobs) => {
			const { username, userId, loggedIn } = req.session
			// Being sure to update all of the checkboxes as well to make them checked as they are now selected from being filtered
			Job.updateMany({	
				$or: [
				{order_number: order, sku: sku, setter: setter, date: date}, 
				{order_number: order, sku: sku, date: date}, 
				{order_number: order, sku: sku},
				{order_number: order, date: date},
				{order_number: order, setter: setter, date: date},
				{order_number: order, setter: setter},
				{date: date, setter: setter},
				{sku: sku, date: date},
				{sku: sku, setter: setter},
				{setter: setter},
				{sku: sku},
				{order_number: order},
				{date: date}
			]}, req.body, {new: true})
				.then(() => {
					res.render('filter', {jobs, username, loggedIn, userId})
				})
			
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})	


router.delete('/:id', (req, res) => {
	const jobId = req.params.id
	Job.findByIdAndRemove(jobId)
		.then(() => {
			res.redirect('/jobs')
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

module.exports = router