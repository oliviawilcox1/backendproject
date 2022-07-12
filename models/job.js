const mongoose = require('./connection')

const User = require('./user')
const Memo = require('./memo')
const { Schema, model } = mongoose
const jobSchema = new Schema(
    {
        order_number: { type: String, required: true },
		sku: { type: String, required: true },
		quantity: { type: Number, required: true },
		stones: { type: Number, required: true},
		date: { type: String, required: true },
        description: { type: String, required: true },
        setter: { type: String, required: true},
		checked: {type: Boolean},
        owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
)

const Job = model('Job', jobSchema)

module.exports = Job