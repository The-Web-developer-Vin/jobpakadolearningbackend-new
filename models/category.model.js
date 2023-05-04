const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    categoryName: {
        type: String,
        required: true,
    },
    image: {
        type: String
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("category", categorySchema, "category");