const mongoose = require("mongoose")

const {Schema} = require("mongoose")

const User = mongoose.model(
    'Users',
    new Schema({
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            image: {
                type: String
            },
            phone: {
                type: String,
                required: true
            },
        },
        {timestamps: true},
    )
)

module.exports = User