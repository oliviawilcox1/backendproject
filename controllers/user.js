const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

const router = express.Router()

router.get('/signup', (req, res) => {
	res.render('auth/signup')
})

router.post('/signup', async (req, res) => {
  req.body.password = await bcrypt.hash(
		req.body.password,
		await bcrypt.genSalt(10)
	)
	// Will hash the password after the user is created and there is no errors
	User.create(req.body)
		.then((user) => {
			res.redirect('/auth/login')
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/login', (req, res) => {
	res.render('auth/login')
})

router.post('/login', async (req, res) => {
	const { username, password } = req.body
	// Find the user
	User.findOne({ username: username })
		.then(async (user) => {
			// if user exists compare passwords
			if (user) {
				const result = await bcrypt.compare(password, user.password)
				if (result) {
					// if its correct they are now logged in and redirect home
					req.session.username = user.username
					req.session.loggedIn = true
					req.session.userId = user.id
          			const { username, loggedIn, userId } = req.session
					res.redirect('/')
				} else {
					res.redirect('/error?error=username%20or%20password%20incorrect')
				}
			} else {
				res.redirect('/error?error=That%20user%20does%20not%20exist')
			}
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})


router.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/')
	})
})


module.exports = router
