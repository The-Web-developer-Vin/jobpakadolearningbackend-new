const mongoose = require("mongoose");

const checkOutPage = new mongoose.Schema(
    {
        first_last_name: {
            type: String
        },
        checkout_email: {
            type: String
        },
        checkout_country: {
            type: Number,
            required: true
        },
        checkout_state: {
            type: String,
        },
        checkout_postal: {
            type: String,
        },
        card_number : {
            type: String,
        },
        expiry_month : {
            type: Number,
        },
        expiry_year : {
            type: Number,
        },
        security_code : {
            type: Number
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("checkOut", checkOutPage, "checkOuts");