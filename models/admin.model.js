const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    Email: {
      type: String,
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    permissions: [
      {
        dashBoard: {
          type: Boolean,
        },
        courses: {
          type: Boolean,
        },
        enrollments: {
          type: Boolean,
        },
        reports: {
          type: Boolean,
        },
        admins: {
          type: Boolean,
        },
        instructors: {
          type: Boolean,
        },
        students: {
          type: Boolean,
        },
      },
    ],
    phoneNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", adminSchema, "Admins");