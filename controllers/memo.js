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
			console.log('memos', memos)
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


// router.get('/previewmemo', (req,res)=> {
// 	Job.find({checked: true})
// 	.populate('owner')
// 	.then(memo => {
// 		const { username, userId, loggedIn } = req.session
// 		console.log('memo.job', memo.job)
// 		console.log('the memo', memo)
// 		console.log('jobs', jobs)
// 		console.log('the memo', memo)
// 		return memo.save()
// 			// .then((memo) => {
// 			// 	console.log('memo', memo)
// 			// 	return memo.job.map((memos) => memos.toObject())
// 			 })

// 			// As well, I will need to map through all of the stones in the Job array and multiply the quantity by $.50
// 			.then((memo) => res.status(200).json({ memo: memo }))
// 			.catch((err) => {
// 			console.log(err)
// 			res.json({ err })
// 			})

// })
router.get('/:id', (req, res) => {
	const memoId = req.params.id
	console.log(memoId)
	Memo.findById(memoId)
		.populate('owner')
		.populate('job')
		.then((memos) => {
			const { username, userId, loggedIn } = req.session
			let newArr = []
			memos.job.map((jobs) => newArr.push(jobs))
			console.log(newArr)
			res.render('printmemo.liquid', { memos, newArr, username, loggedIn, userId })
		})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})

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