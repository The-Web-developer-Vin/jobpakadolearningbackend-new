const mongoose = require("mongoose");

const userAuthschema = new mongoose.Schema(
    {
        Name: {
            type: String
        },
        Email: {
            type: String
        },
        mobile_number: {
            type: Number,
            required: true
        },
        role: {
            type: String,
            enum: ['User', 'Instructor'],
            // required: true
        },
        city: {
            type: String
        },
        whatsapp: {
            type: Boolean, 
            default: false
        },
        verifyOtp: {
            type: String
        },
        newUser: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("userAuth", userAuthschema, "userAuth");