const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
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

module.exports = mongoose.model("cart", cartSchema, "cart");