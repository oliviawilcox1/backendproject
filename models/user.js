const { Schema, model } = require('./connection.js')

const UserSchema = new Schema(
	{
		username: { 
			type: String, 
			required: true, 
			unique: true 
		},
		password: { 
			type: String, 
			required: true 
		}
	},
	{ timestamps: true }
)

const User = model('User', UserSchema)

module.exports = User
