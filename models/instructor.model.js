const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({

    userAuthId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: "userAuth",
        required: true                
    },
    image: {
        type: String
    },
    role: {
        type: String
    },
    description: {
        type: String
    },
    revenue: {
        type: Number
    },
    bankName: {
        type: String
    },
    name_as_per_bank: {
        type: String
    },
    ifsc_code: {
        type: String
    },
    accountnumber: {
        type: String
    },
    upi_id: {
        type: String
    },
    // name: {
    //     type: String
    // },
    // Email: {
    //     type: String
    // },
    // linkedIn: {
    //     type: String
    // },
    // uploadResume: {
    //     type: String
    // },
    // company: {
    //     type: String
    // },
    // experience: {
    //     type: String
    // }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("instructor", instructorSchema, "instructor");