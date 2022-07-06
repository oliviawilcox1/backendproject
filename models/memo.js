const mongoose = require('./connection')

const User = require('./user')
const { Schema, model } = mongoose
const memoSchema = new Schema(
    {
        order_number: { type: String, required: true },
		sku: { type: String, required: true },
		quantity: { type: Number, required: true },
		stones: { type: Number, required: true},
        description: { type: String, required: true },
        setter: { type: String, required: true},
        assigned: {type: String, required: true},
        number: {type: Number, required: true},
        owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
)

const Memo = model('Memo', memoSchema)

module.exports = Memo