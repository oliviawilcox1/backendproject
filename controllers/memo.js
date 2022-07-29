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

// *********** GET/Index Route for Memos **************
router.get('/', (req, res) => {
	// Finding all memos
	Memo.find({})
	    .populate('owner')
		.populate('job')
		.then(memos => {
			const { username, userId, loggedIn } = req.session
			res.render('memos/indexmemos', { memos, username, loggedIn, userId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// *********** GET Route for Preview Memo **************
router.get('/previewmemo', (req,res)=> {
	const { username, userId, loggedIn } = req.session
	// Sample Memo Before actually creating it to see if this is the correct data you want to make a memo with
	Job.find({checked: true})
	.populate('owner')
			.then((jobs) => {		
			res.render('memos/previewpage.liquid', { jobs,  username, loggedIn, userId })
			})
			.catch((err) => {
			console.log(err)
			res.json({ err })
			})

})

// *********** GET/Show Route for Memo **************
router.get('/:id', (req, res) => {
	const memoId = req.params.id
	Memo.findById(memoId)
		.populate('owner')
		.populate('job')
		.then((memos) => {
			const { username, userId, loggedIn } = req.session
			// Mapping over the memos and pushing the jobs objects into a new array
			let newArr = []
			memos.job.map((jobs) => newArr.push(jobs))
			// Mapping through the NewArr and adding together the stones then multiplying by.50
			let stoneSum = 0
			newArr.map((jobs) => (stoneSum += jobs.stones))
			stoneSum = stoneSum * .50
			// Mapping through the NewArr and adding together the stones
			let sumQuantity = 0
			newArr.map((jobs) => sumQuantity += jobs.quantity)
			// Mapping through the NewArr and adding together the quantity
			let stonesQuantity = 0
			newArr.map((jobs) => stonesQuantity += jobs.stones)
			// Passing the data to render on the page
			res.render('memos/printmemo.liquid', { memos, newArr, stoneSum, sumQuantity, stonesQuantity, username, loggedIn, userId })
		})
		.catch((err) => {
			console.log(err)
			res.json({ err })
		})
})

// *********** DELETE Route for Specific Memo **************
router.delete('/:id', (req, res) => {
	const memoId = req.params.id
	Memo.findByIdAndRemove(memoId)
		.then(() => {
			res.redirect('back')
		})
		.catch((error) => {
			console.log(error)
			res.json({ error })
		})
})

module.exports = router