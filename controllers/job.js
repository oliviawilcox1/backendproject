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
	Job.find({})
		.populate('owner')
		.then(jobs => {
			const { username, userId, loggedIn } = req.session
			console.log('this is the job', jobs)
			console.log('this is the params', req.params)

			res.render('index', { jobs, username, loggedIn, userId })

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
// let newArr = []
router.put('/checked/:id', (req, res) => {
	const jobId = req.params.id
	req.body.checked = req.body.checked === 'on' ? true : false
	console.log('req.body', req.body)
	Job.findByIdAndUpdate(jobId, req.body,{ new: true })
		.then((job) => {
			// newArr.push(jobId)
			// console.log(newArr)
			console.log('the updated job', job)
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})



// router.post('/creatememo', (req,res) => {
// 	if (req.body.checked === 'on') {
// 		console.log(req.body.checked)
// 	}
//     const jobId = req.body.id
//     console.log('first comment body', req.body)
//     //we'll findn the fruit with fruitid
//     Job.find(req.body.checked === true)
//     //then we'll adjust req.body to include an author
//         .then(memo => {
//             memo.job.push(req.body)
//             return memo.save()
//         })
//         .then(memo => {
//             res.redirect(`/memo`)
//         })
//     .catch(error => {
//         console.log(error)
//         res.send(error)
//     })
// })



router.put('/checked', (req, res) => {
	const { username, userId, loggedIn } = req.session
	req.body.checked = req.body.checked === false ? false : true
	console.log('req.body', req.body)
	Job.updateMany({}, req.body,{ new: true })
		.then((job) => {

			console.log('the updated job', job)
			res.redirect('back')
		})
		.catch((error) => res.json(error))
})

router.put('/unchecked', (req, res) => {
	req.body.checked = req.body.checked === true ? false : false
	console.log('req.body', req.body)
	Job.updateMany({}, req.body,{ new: true })
		.then((job) => {
			console.log('the updated job', job)
			res.redirect('back')
		})

		.catch((error) => res.json(error))
})

router.post('/new', (req,res)=> {
	console.log(req.body)
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
// MEMOS 
router.post('/show/', (req, res) => {
	const username = req.session.username
	const loggedIn = req.session.loggedIn
	const userId = req.session.userId
	Job.find({checked: true})
	.populate('owner')
	.populate('memo')
	.then(jobs => {
		console.log('Checked Jobs', jobs)
		Memo.create(req.body)
			.then(memo => {
			// const username = req.session.username
			// const loggedIn = req.session.loggedIn
			// const userId = req.session.userId
			console.log('the memo', memo)
			console.log('jobs', jobs)
			memo.job.push(jobs)
			console.log('the memo', memo)
			return memo.save()
			
			// .then((memo) => {
			// 	console.log('memo', memo)
			// 	return memo.job.map((memos) => memos.toObject())
			// })
			.catch((err) => {
			console.log(err)
			res.json({ err })
			})
	}) 
			.then(memo => {
				memo.job.map((jobs) => console.log('jobs',jobs))
				res.render('printmemo.liquid', { jobs,  username, loggedIn, userId })
			})
	})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
		// if there is an error, show that instead
		// .catch((err) => {
		// 	console.log(err)
		// 	res.json({ err })
		// })
})

// router.get('/filter/', (req, res) => {
// 	Job.find({})
// 		.then(jobs => {
// 			const { username, userId, loggedIn } = req.session
// 			console.log('this is the job', jobs)
// 			console.log('this is the params', req.params)
// 			res.render('filter', { jobs, username, loggedIn, userId })
// 		})
// 		.catch((err) => {
// 			console.log('req.query',req.query)
// 			console.log(err)
// 			res.json({ err })
// 		})
//   });

router.get('/show', (req, res) => {
	let order = req.query.order_number;
	let sku = req.query.sku;
	let setter = req.query.setter
	let date = req.query.date

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
		.then((jobs) => {
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			const userId = req.session.userId
			res.render('index', {jobs, username, loggedIn, userId})
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