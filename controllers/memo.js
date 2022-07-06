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
		.populate('job')
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

// router.get('/:id', (req, res) => {
// 	if (req.body.checked === 'on') {
// 		console.log(req.body.checked)
// 	}
// 	const memoId = req.params.id
// 	console.log(memoId)
// 	Memo.findById(memoId)

// 		.then((memos) => {
// 			const username = req.session.username
// 			const loggedIn = req.session.loggedIn
// 			const userId = req.session.userId
// 			res.render('printmemo.liquid', { memos, username, loggedIn, userId })
// 		})
// 		// if there is an error, show that instead
// 		.catch((err) => {
// 			console.log(err)
// 			res.json({ err })
// 		})
// })

router.post('/memos/creatememo', (req,res) => {

    const jobId = req.body.id
    // console.log('first comment body', req.body)
    req.body.author = req.session.userId
    Job.find({checked: true})
  
        .then(memo => {
            memo.job.push(req.body)
            return memo.save()
        })
        .then(memo => {
            res.redirect(``)
        })
    .catch(error => {
        console.log(error)
        res.send(error)
    })
})

module.exports = router