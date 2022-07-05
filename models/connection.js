require("dotenv").config()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, {
	useUnifiedTopology: true,
    useNewUrlParser: true,
})

const db = mongoose.connection 

db.on('open', () => console.log(`Mongoose connected to ${mongoose.connection.host}:${mongoose.connection.port}`))
db.on('close', ()=> console.log(`Mongoose disconnected from ${mongoose.connection.host}:${mongoose.connection.port}`))
db.on('error', (error)=> console.log(error))

module.exports = mongoose