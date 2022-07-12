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
	    .populate('owner')
		.populate('job')
		.then(memos => {
			const { username, userId, loggedIn } = req.session
			// Once jobs are inserting try this
			// return memos.job.map((memo) => memo.toObject())
			return memos.map((memo) => memo.toObject())
		})
		// .then((memos) => res.status(200).json({ memos: memos }))
		.then(memos => {
			const { username, userId, loggedIn } = req.session
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
		.populate('owner')
		.populate('job')
		.then((memos) => {
			const { username, userId, loggedIn } = req.session
			// This is undefined because there is currently no jobs
			// Check back to see if it works after jobs are uploading
			// console.log('memos.job', memos.job)
			// return memos.job.map((memo) => memo.toObject())
			res.render('printmemo.liquid', { memos, username, loggedIn, userId })
		})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})

// router.post('/memos/creatememo', (req,res) => {

//     const jobId = req.body.id
//     // console.log('first comment body', req.body)
//     req.body.author = req.session.userId
//     Job.find({checked: true})
  
//         .then(memo => {
//             memo.job.push(req.body)
//             return memo.save()
//         })
//         .then(memo => {
//             res.redirect(``)
//         })
//     .catch(error => {
//         console.log(error)
//         res.send(error)
//     })
// })

router.delete('/:id', (req, res) => {
	const memoId = req.params.id
	Memo.findByIdAndRemove(memoId)
		.then((memo) => {
			console.log('this is the response from memo', memo)
			res.redirect('back')
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

module.exports = router