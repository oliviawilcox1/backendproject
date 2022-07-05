// Dependencies 
require("dotenv").config()
const express = require("express")
const middleware = require("./utils/middleware")
const JobRouter = require('./controllers/job')
const UserRouter = require('./controllers/user')
// Middleware
const app = require("liquid-express-views")(express())
middleware(app)


// Routes
app.use('/jobs', JobRouter)
app.use('/auth', UserRouter)


app.get('/', (req, res) => {
    const { username, userId, loggedIn } = req.session
	res.render('home.liquid', { loggedIn, username, userId })
})

app.get('/error', (req, res) => {
	const error = req.query.error || 'This Page Does Not Exist'
    const { username, loggedIn, userId } = req.session
	res.render('error.liquid', { error, username, loggedIn, userId })
})


// Error Page
app.all('*', (req,res) => {
    res.redirect('/error')
})

// App Listener
app.listen(process.env.PORT, ()=> {
    console.log(`Port=${process.env.PORT}`)
})