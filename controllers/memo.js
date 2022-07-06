const express = require('express')
const Memo = require('../models/memo')
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
	Memo.find({})
		.then(memos => {
			// const username = req.session.username
			// const loggedIn = req.session.loggedIn
			//console.log('this is the username of the session ', req.session.username)
			const { username, userId, loggedIn } = req.session
			console.log('this is the memo', memos)
			console.log('this is the params', req.params)
			// console.log('this is the req', req)
			// console.log('this is the res', res)
			res.render('indexmemos', { memos, username, loggedIn, userId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/:id', (req, res) => {
	const memoId = req.params.id
	console.log(memoId)
	Memo.findById(memoId)

		.then((memos) => {
			const username = req.session.username
			const loggedIn = req.session.loggedIn
			const userId = req.session.userId
			res.render('printmemo.liquid', { memos, username, loggedIn, userId })
		})
		// if there is an error, show that instead
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})



router.post('/new', (req,res)=> {
	console.log(req.body)
	console.log('req.session', req.session.userId)
	const { username, userId, loggedIn } = req.session
	// req.body.owner = req.session.userId
	console.log('this is req.body', req.body)

	// Job.find(req.body.checked)
	// .then(jobs => {
	// 	// const username = req.session.username
	// 	// const loggedIn = req.session.loggedIn
	// 	//console.log('this is the username of the session ', req.session.username)
	// 	const { username, userId, loggedIn } = req.session
	// 	console.log('this is the job', jobs)
	// 	console.log('this is the params', req.params)
	// 	// console.log('this is the req', req)
	// 	// console.log('this is the res', res)
	// })
	// .catch(error => {
	// 	res.redirect(`/error?error=${error}`)
	// })

	Memo.create(Job)
		.then(memos => {
			console.log('this was what is returned', memos)
			res.redirect('/memos/:id')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})


module.exports = router