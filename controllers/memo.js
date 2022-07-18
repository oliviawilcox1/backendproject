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
			res.render('indexmemos', { memos, username, loggedIn, userId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/previewmemo', (req,res)=> {
	const { username, userId, loggedIn } = req.session
	Job.find({checked: true})
	.populate('owner')
			.then((jobs) => {		
			res.render('previewpage.liquid', { jobs,  username, loggedIn, userId })
			})

			.catch((err) => {
			console.log(err)
			res.json({ err })
			})

})

router.get('/:id', (req, res) => {
	const memoId = req.params.id
	Memo.findById(memoId)
		.populate('owner')
		.populate('job')
		.then((memos) => {
			const { username, userId, loggedIn } = req.session
			// Initializing a new Array and pushing each job
			let newArr = []
			memos.job.map((jobs) => newArr.push(jobs))
			// Going through the array and adding the number of stones and multiplying them to get the total amount
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

router.delete('/:id', (req, res) => {
	const memoId = req.params.id
	Memo.findByIdAndRemove(memoId)
		.then((memo) => {
			res.redirect('back')
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

module.exports = router