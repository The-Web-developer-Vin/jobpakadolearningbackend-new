const mongoose = require("mongoose");

const userschema = new mongoose.Schema(
  {
    userAuthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userAuth",
      required: true
    },
    profilePhoto: {
      type: String,
    },
    gender: {
      type: String,
    },
    dob: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    deactivate: { 
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userschema, "users");