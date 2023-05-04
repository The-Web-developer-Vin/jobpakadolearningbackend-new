const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userAuth",
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course",
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("wishList", wishListSchema, "wishLists");