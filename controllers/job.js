const express = require('express')
const Job = require('../models/job')

const router = express.Router()

router.use((req, res, next) => {

	if (req.session.loggedIn) {
		next()
	} else {
		res.redirect('/auth/login')
	}
})

router.get('/', (req, res) => {
	Job.find({})
		.then(jobs => {
			// const username = req.session.username
			// const loggedIn = req.session.loggedIn
			//console.log('this is the username of the session ', req.session.username)
			const { username, userId, loggedIn } = req.session
			console.log('this is the job', jobs)
			console.log('this is the params', req.params)
			// console.log('this is the req', req)
			// console.log('this is the res', res)
			res.render('index', { jobs, username, loggedIn, userId })

		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/new', (req, res) => {
    // destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	//console.log(req.session)

	Job.find({ owner: userId})
		.then(jobs => {
	
			res.render('create.liquid', { jobs, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


router.put('/checked', (req, res) => {
	
	
	req.body.checked = req.body.checked === false ? false : true
	console.log('req.body', req.body)
	Job.updateMany({}, req.body,{ new: true })

		.then((job) => {
			console.log('the updated job', job)
			res.redirect(`/jobs`)
		})
		// if an error, display that
		.catch((error) => res.json(error))
})
router.put('/unchecked', (req, res) => {
	
	
	req.body.checked = req.body.checked === true ? false : false
	console.log('req.body', req.body)
	Job.updateMany({}, req.body,{ new: true })

		.then((job) => {
			console.log('the updated job', job)
			res.redirect(`/jobs`)
		})
		// if an error, display that
		.catch((error) => res.json(error))
})


router.post('/new', (req,res)=> {
	console.log(req.body)
	console.log('req.session', req.session.userId)
	const { username, userId, loggedIn } = req.session
	req.body.checked = req.body.checked === 'on' ? true : false
		req.body.owner = req.session.userId
		Job.create(req.body)
			.then(jobs => {
				console.log('this was what is returned', jobs)
				res.redirect('/jobs/new')
			})
			.catch(error => {
				res.redirect(`/error?error=${error}`)
			})
})

// router.get('/:id', (req, res) => {
// 	const jobId = req.params.id
// 	console.log(jobId)
// 	Job.findById(jobId)

// 		.then((jobs) => {
// 			const username = req.session.username
// 			const loggedIn = req.session.loggedIn
// 			const userId = req.session.userId
// 			res.render('show.liquid', { jobs, username, loggedIn, userId })
// 		})
// 		// if there is an error, show that instead
// 		.catch((err) => {
// 			console.log(err)
// 			res.json({ err })
// 		})
// })


// Assign route
router.get('/filter/', (req, res) => {
	// const filters = req.params;
	// let order = req.query.order_number;
	// let sku = req.query.sku;
	// console.log('req.query',req.query)
	
	// Job.find({order_number: order, sku: req.query.sku})
	// 	.then((jobs) => {
	// 		const username = req.session.username
	// 		const loggedIn = req.session.loggedIn
	// 		const userId = req.session.userId
	// 		// res.redirect(`jobs/${filters}`, { jobs, username, loggedIn, userId })
	// 		res.redirect('jobs/show', {jobs})
	// 	})
	Job.find({})
		.then(jobs => {
			// const username = req.session.username
			// const loggedIn = req.session.loggedIn
			//console.log('this is the username of the session ', req.session.username)
			const { username, userId, loggedIn } = req.session
			console.log('this is the job', jobs)
			console.log('this is the params', req.params)
			
			res.render('filter', { jobs, username, loggedIn, userId })
			let order = req.query.order_number;
			console.log('req.query',req.query)
		})
		
		.catch((err) => {
			console.log('req.query',req.query)
			console.log(err)
			res.json({ err })
		})
	
  });

router.get('/show', (req, res) => {
	let order = req.query.order_number;
	let sku = req.query.sku;
	let setter = req.query.setter
	let createdAt = req.query.createdAt
	console.log('req.query',req.query)
	console.log('order', order)

	Job.find({ 
		 
		$or: [
			{$and: [{order_number: order}, {sku:sku}, {setter: setter}]},
			{order_number: order, sku:sku}, 

			{sku: sku},
			{setter: setter}, 
			{createdAt: createdAt},
		] 
})
		.then((jobs) => {
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			const userId = req.session.userId
			res.render('show', {jobs, username, loggedIn, userId})
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})	

router.delete('/:id', (req, res) => {
	// get the fruit id
	const jobId = req.params.id
	// delete the fruit
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