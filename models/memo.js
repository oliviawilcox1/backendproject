const mongoose = require('./connection')

const User = require('./user')
const Job = require('./job')


const { Schema, model } = mongoose
const memoSchema = new Schema(
    {
        owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		job: {
			type: Schema.Types.ObjectId,
			ref: 'Job'
	},
},
	{ timestamps: true }
)

const Memo = model('Memo', memoSchema)

module.exports = Memo