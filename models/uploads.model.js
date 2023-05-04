const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({

    image: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('upload', uploadSchema, 'uploads');