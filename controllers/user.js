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

	console.log('req.body', req.body);
	
	const { username, password } = req.body

	User.findOne({ username: username })
		.then(async (user) => {
	
			if (user) 
            {
				const result = await bcrypt.compare(password, user.password)

				if (result) 
                {
					console.log('the user', user);
					req.session.username = user.username
					req.session.loggedIn = true
					req.session.userId = user.id

          			const { username, loggedIn, userId } = req.session

					console.log('session user id', req.session.userId)
				
					res.redirect('/')
				} else 
                {
					res.redirect('/error?error=username%20or%20password%20incorrect')
				}
			} else 
            {
				res.redirect('/error?error=That%20user%20does%20not%20exist')
			}
		})
	
		.catch((error) => {
			console.log('the error', error);
			
			res.redirect(`/error?error=${error}`)
		})
})



router.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/')
	})
})


module.exports = router
