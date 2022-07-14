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
	req.body.checked = req.body.checked === true ? false : false
	
	Job.find({})
		.populate('owner')
		.then(jobs => {
			const { username, userId, loggedIn } = req.session
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
	Job.find({ owner: userId})
		.then(jobs => {
			res.render('create.liquid', { jobs, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.put('/checked/:id', (req, res) => {
	const jobId = req.params.id
	req.body.checked = req.body.checked === 'on' ? true : false
	console.log('req.body', req.body)
	Job.findByIdAndUpdate(jobId, req.body,{ new: true })
		.then((job) => {
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})


router.put('/checked', (req, res) => {
	const { username, userId, loggedIn } = req.session
	console.log(req.body)

	req.body.checked = req.body.checked === false ? false : true
	Job.updateMany({}, req.body,{ new: true })
		.then((job) => {
			console.log(job)
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})


router.put('/unchecked', (req, res) => {
	req.body.checked = req.body.checked === true ? false : false
	Job.updateMany({}, req.body,{ new: true })
		.then((job) => {
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})

router.post('/new', (req,res)=> {
	const { username, userId, loggedIn } = req.session
	req.body.checked = req.body.checked === 'on' ? true : false
	req.body.owner = req.session.userId
	Job.create(req.body)
		.then(jobs => {
			res.redirect('/jobs/new')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.post('/creatememo/', (req, res) => {
	const username = req.session.username
	const loggedIn = req.session.loggedIn
	const userId = req.session.userId
	Job.find({checked: true}).lean()
	.populate('owner')
	.then(jobs => {
		console.log('Checked Jobs', jobs)
		 Memo.create({job: jobs})
			.then(memo => {
		    // const { username, userId, loggedIn } = req.session
		    console.log('the memo', memo._id)
			return memo.save()
			})

			.then(memos => {
				const { username, userId, loggedIn } = req.session
			
				let newArr = []
				memos.job.map((jobs) => newArr.push(jobs))
	
				let stoneSum = 0
				newArr.map((jobs) => (stoneSum += jobs.stones))
				stoneSum = stoneSum * .50
	
	
				let sumQuantity = 0
				newArr.map((jobs) => sumQuantity += jobs.quantity)

				let stonesQuantity = 0
				newArr.map((jobs) => stonesQuantity += jobs.stones)
	
				// res.render('printmemo.liquid', { memos, newArr, stoneSum, sumQuantity, stonesQuantity, username, loggedIn, userId })
		

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
	console.log(memoId)
	Memo.findById(memoId)
		.populate('owner')
		.populate('job')
		.then((memos) => {
			const { username, userId, loggedIn } = req.session
			
			let newArr = []
			memos.job.map((jobs) => newArr.push(jobs))

			let stoneSum = 0
			newArr.map((jobs) => (stoneSum += jobs.stones))
			stoneSum = stoneSum * .50


			let sumQuantity = 0
			newArr.map((jobs) => sumQuantity += jobs.quantity)

			let stonesQuantity = 0
			newArr.map((jobs) => stonesQuantity += jobs.stones)

			res.render('printmemo.liquid', { memos, newArr, stoneSum, sumQuantity, stonesQuantity, username, loggedIn, userId })
		})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})
	

router.get('/show', (req, res) => {
	let order = req.query.order_number;
	let sku = req.query.sku;
	let setter = req.query.setter
	let date = req.query.date
	req.body.checked = req.body.checked === false ? false : true
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
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			const userId = req.session.userId
			console.log(jobs)
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
				.then((job) => {
					console.log('jobs',jobs)
					console.log('job', job)
					res.render('filter', {jobs, username, loggedIn, userId})
					// res.redirect('back')
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
		.then((job) => {
			console.log('this is the response from job', job)
			res.redirect('/jobs')
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

module.exports = router