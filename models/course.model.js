const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    courseCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "instructor",
        required: true,
    },
    bestSeller: {
        type: Boolean
    },
    title: {
        type: String,
        required: true
    },
    titleDescription: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    whatUwillLearn: [{
        description: {
            type: String,
            required: true
        }
    }],
    courseIncludes: [{
        description: {
            type: String,
            required: true
        }
    }],
    courseLength: {
        type: String
    },
    courseContent: [{
        sectionTitle: {
            type: String
        },
        sectionDuration: {
            type: String
        },
        section: [{
            lectureTitle: {
                type: String
            },
            lecture: {
                type: String
            },
            duration: {
                type: String
            },
            preview: {
                type: Boolean,
                default: false
            }
        }]
    }],
    requirements: [{
        description: {
            type: String,
            required: true
        }
    }],
    description: {
        type: String,
        required: true
    },
    courseFor: [{
        description: {
            type: String,
            required: true
        }
    }],
    image: {
        type: String
    },
    actualPrice: {
        type: Number
    },
    offerPrice: {
        type: Number
    },
    status: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("course", courseSchema, "courses");