const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['percent', 'amount'],
      required: true,
    },
    validity: {
      type: Date,
      required: true,
    },
    couponAmount: {
      type: Number,
      required: true,
    },
    couponcode: {
      type: String,
      required: true,
    },
    minAmount: {
      type: Number,
      required: true,
    },
    // usedCoupon:{
    //     type:Boolean,
    //     default:true
    // },
    userUsed: {
      type: Array,
      required: true,
    },
    couponFor: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("coupon", couponSchema, "coupon");
