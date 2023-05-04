const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");
const userModel = require("../models/user.model");
const payment_logModel = require("../models/payment_log.model");
const courseModel = require("../models/course.model");
const instructorModel = require("../models/instructor.model");
const fs = require("fs");
const fastcsv = require("fast-csv");

exports.signup = async (req, res) => {
    try {
        const admin = req.body;
        const adminId =
            req.body.adminId && mongoose.isValidObjectId(req.body.adminId)
                ? req.body.adminId
                : new mongoose.Types.ObjectId();
        const adminCreated = await adminModel.findOneAndUpdate(
            { _id: adminId },
            admin,
            { new: true, upsert: true }
        );
        res.status(201).send({
            data: adminCreated,
            error: null,
            status: 1,
            message: "Created Admin Successfully",
        });
    } catch (error) {
        console.log(error)
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Creating Admin",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const adminExists = await adminModel.findOne({ Email: req.body.Email });
        if (!adminExists) {
            return res.send({
                data: null,
                error: "Admin Doesn't Exists",
                message: "Email Doesn't Exists",
            });
        }
        if (adminExists.password == req.body.password) {
            const token = jwt.sign(
                { _id: adminExists._id, name: adminExists.Name , role : "Admin"},
                process.env.ADMIN_JWT_TOKEN_KEY,
                {
                    expiresIn: "24h",
                }
            );
            res.status(201).send({
                data: { admin: adminExists, token: token },
                error: null,
                message: "Login Successfully",
            });
        } else {
            res.send({
                data: null,
                message: "Incorrect Password",
            });
        }
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Login The Account",
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber
            ? parseInt(req.query.pageNumber)
            : 1;
        let search = req.query.searchKey ? req.query.searchKey : "";
        const adminAggregate = [
            {
                $match: {
                    $or: [
                        { Name: { $regex: `${search}.*`, $options: "i" } },
                        { Email: { $regex: `${search}.*`, $options: "i" } },
                        { password: { $regex: `${search}.*`, $options: "i" } },
                    ],
                },
            },
            {
                $facet: {
                    pagination: [
                        { $count: "total" },
                        { $addFields: { page: pageNumber } },
                    ],
                    data: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }], // add projection here wish you re-shape the docs
                },
            },
        ];
        if (req.query.sort == "Email") {
            adminAggregate.splice(1, 0, {
                $sort: { Email: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "Name") {
            adminAggregate.splice(1, 0, {
                $sort: { Name: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "permissions") {
            adminAggregate.splice(1, 0, {
                $sort: { permissions: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "phoneNumber") {
            adminAggregate.splice(1, 0, {
                $sort: { Email: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "createdAt") {
            adminAggregate.splice(1, 0, {
                $sort: { createdAt: parseInt(req.query.sortValue) }
            })
        }
        let adminDetails = await adminModel.aggregate(adminAggregate);
        res.status(200).send({
            data: adminDetails,
            message: "Admin Details",
            status: 200,
        });
    } catch (error) {
        res.status(400).send({
            error: error,
            message: "Error In Geting Admin",
            status: 400,
        });
    }
};

exports.delete_admin = async (req, res) => {
    try {
        const adminExists = await adminModel.findOne({ _id: req.params.adminId });
        const delete_admin = await adminModel.findOneAndDelete({
            _id: req.params.adminId,
        });
        if (delete_admin) {
            const token = jwt.sign(
                { _id: adminExists._id },
                process.env.ADMIN_JWT_TOKEN_KEY,
                {
                    expiresIn: "1s",
                }
            );
        }
        res.status(200).send({
            data: delete_admin,
            error: null,
            status: 1,
            message: "Deleted Admin Successfully",
        });
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Deleting Admin",
        });
    }
};

exports.admin_dashboard = async (req, res) => {
    try {
        const newdate = new Date()
        const date1 = newdate.toISOString().slice(0, 8) + "01T00:00:00.000Z";
        const date2 = newdate.toISOString().slice(0, 8) + "31T23:59:59.999Z";
        var data = [];
        var data2 = [];
        const users = await userModel.find();
        var totalRevenue = 0;
        var monthlyRevenue = 0;
        const user = await userModel.countDocuments();
        const userMonthly = await userModel.countDocuments({ createdAt: { $gte: new Date(date1), $lte: new Date(date2) } });
        const get_payment = await payment_logModel.find().lean();
        for (let i = 0; i < get_payment.length; i++) {
            totalRevenue += parseFloat(get_payment[i].amount)
        }
        const monthly_payment = await payment_logModel.find({ createdAt: { $gte: new Date(date1), $lte: new Date(date2) } }).lean();
        for (let j = 0; j < monthly_payment.length; j++) {
            monthlyRevenue += parseFloat(monthly_payment[j].amount)
        }
        const courses = await courseModel.countDocuments();
        const instructor = await instructorModel.countDocuments();

        res.status(200).send({
            data: { user, userMonthly, courses, instructor, totalRevenue, monthlyRevenue },
            error: null,
            status: 1,
            message: "Getting Counts Successfully",
        });
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Getting Counts",
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const admin = await adminModel.findOne({ _id: req.params.adminId })
        res.status(200).send({
            data: admin,
            error: null,
            status: 1,
            message: "getting admin successfully"
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Getting admin",
        });
    }
}

exports.adminRevenue = async (req, res) => {
    try {
        let search = req.query.searchKey ? req.query.searchKey : "";
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber
            ? parseInt(req.query.pageNumber)
            : 1;

        var start = req.query.start + "T00:00:00.000Z";
        var end = req.query.end + "T23:59:59.999Z";
        var from = req.query.from + "T00:00:00.000Z";
        var to = req.query.to + "T23:59:59.999Z";
        // let fil ;
        // let cat1;
        if (req.query.course) {
            let fil = req.query.course;
            var cat1 = fil.split(",");
        }
        if (req.query.status) {
            let fil = req.query.status;
            var cat2 = fil.split(",");
        }
        var data;
        if (req.query.from && req.query.to) {
            data = [
                {
                    $lookup: {
                        from: "payment_logs",
                        localField: "_id",
                        foreignField: "courseId",
                        as: "enrollments",
                    },
                },
                {
                    $match: {
                        "enrollments.createdAt": {
                            $gte: new Date(from),
                            $lte: new Date(to)
                        }
                    }
                },
                {
                    $lookup: {
                        from: "instructor",
                        localField: "instructor",
                        foreignField: "_id",
                        as: "mentorsId",
                    },
                },
                {
                    $unwind: "$mentorsId",
                },
                {
                    $lookup: {
                        from: "userAuth",
                        localField: "mentorsId.userAuthId",
                        foreignField: "_id",
                        as: "userAuth",
                    },
                },
                {
                    $unwind: "$userAuth",
                },
                {
                    $addFields: {
                        enrolled: { $size: "$enrollments" },
                        status: { $toString: "$status" }

                    },
                },
                {
                    $project: {
                        // courseId:"$_id",
                        courseName: "$title",
                        // enrolledBy: "$enrollments.enrolledBy",
                        prices: "$offerPrice",
                        enrolled: "$enrolled",
                        earned: { $multiply: ["$offerPrice", "$enrolled"] },
                        percent: "$mentorsId.revenue",
                        mentorRevenue: {
                            $multiply: [
                                { $multiply: ["$offerPrice", "$enrolled"] },
                                { $divide: ["$mentorsId.revenue", 100] },
                            ],
                        },
                        revenue: {
                            $subtract: [
                                { $multiply: ["$offerPrice", "$enrolled"] },
                                {
                                    $multiply: [
                                        { $multiply: ["$offerPrice", "$enrolled"] },
                                        { $divide: ["$mentorsId.revenue", 100] },
                                    ],
                                },
                            ],
                        },
                        courseStatus: "$status",
                        mentorName: "$userAuth.Name",
                        createdAt: "$createdAt",
                    },
                },
                {
                    $match: {
                        $or: [
                            { courseStatus: { $regex: `${search}.*`, $options: "i" } },
                            { prices: parseFloat(req.query.searchKey) },
                            { courseName: { $regex: `${search}.*`, $options: "i" } },
                            { mentorName: { $regex: `${search}.*`, $options: "i" } },
                            { enrolled: parseFloat(req.query.searchKey) },
                            { earned: parseFloat(req.query.searchKey) },
                            { mentorRevenue: parseFloat(req.query.searchKey) },
                            { revenue: parseFloat(req.query.searchKey) },
                        ],
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $facet: {
                        pagination: [
                            { $count: "total" },
                            { $addFields: { page: pageNumber } },
                        ],
                        data: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }], // add projection here wish you re-shape the docs
                    },
                },

            ];
        }
        else {
            data = [
                {
                    $lookup: {
                        from: "payment_logs",
                        localField: "_id",
                        foreignField: "courseId",
                        as: "enrollments",
                    },
                },
                {
                    $lookup: {
                        from: "instructor",
                        localField: "instructor",
                        foreignField: "_id",
                        as: "mentorsId",
                    },
                },
                {
                    $unwind: "$mentorsId",
                },
                {
                    $lookup: {
                        from: "userAuth",
                        localField: "mentorsId.userAuthId",
                        foreignField: "_id",
                        as: "userAuth",
                    },
                },
                {
                    $unwind: "$userAuth",
                },
                {
                    $addFields: {
                        enrolled: { $size: "$enrollments" },
                        status: { $toString: "$status" }
                    },
                },
                {
                    $project: {
                        // courseId:"$_id",
                        courseName: "$title",
                        // enrolledBy: "$enrollments.enrolledBy",
                        prices: "$offerPrice",
                        enrolled: "$enrolled",
                        earned: { $multiply: ["$offerPrice", "$enrolled"] },
                        percent: "$mentorsId.revenue",
                        mentorRevenue: {
                            $multiply: [
                                { $multiply: ["$offerPrice", "$enrolled"] },
                                { $divide: ["$mentorsId.revenue", 100] },
                            ],
                        },
                        revenue: {
                            $subtract: [
                                { $multiply: ["$offerPrice", "$enrolled"] },
                                {
                                    $multiply: [
                                        { $multiply: ["$offerPrice", "$enrolled"] },
                                        { $divide: ["$mentorsId.revenue", 100] },
                                    ],
                                },
                            ],
                        },
                        courseStatus: "$status",
                        mentorName: "$userAuth.Name",
                        createdAt: "$createdAt",
                    },
                },
                {
                    $match: {
                        $or: [
                            { courseStatus: { $regex: `${search}.*`, $options: "i" } },
                            { prices: parseFloat(req.query.searchKey) },
                            { courseName: { $regex: `${search}.*`, $options: "i" } },
                            { mentorName: { $regex: `${search}.*`, $options: "i" } },
                            { enrolled: parseFloat(req.query.searchKey) },
                            { earned: parseFloat(req.query.searchKey) },
                            { mentorRevenue: parseFloat(req.query.searchKey) },
                            { revenue: parseFloat(req.query.searchKey) },
                        ],
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $facet: {
                        pagination: [
                            { $count: "total" },
                            { $addFields: { page: pageNumber } },
                        ],
                        data: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }], // add projection here wish you re-shape the docs
                    },
                },
            ];
        }
        if (req.query.start && req.query.end) {
            data.splice(6, 0, {
                $match: {
                    createdAt: {
                        $gte: new Date(start),
                        $lte: new Date(end),
                    },
                },
            });
        }
        if (req.query.status) {
            data.splice(6, 0, {
                $match: {
                    courseStatus: { $in: cat1 }
                },
            });
        }
        if (req.query.course) {
            data.splice(6, 0, {
                $match: {
                    courseName: { $in: cat2 }
                }
            });
        }
        if (req.query.sort == "courseName") {
            data.splice(8, 0, {
                $sort: { courseName: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "prices") {
            data.splice(8, 0, {
                $sort: { prices: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "enrolled") {
            data.splice(8, 0, {
                $sort: { enrolled: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "earned") {
            data.splice(8, 0, {
                $sort: { earned: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "mentorRevenue") {
            data.splice(8, 0, {
                $sort: { mentorRevenue: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "revenue") {
            data.splice(8, 0, {
                $sort: { revenue: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "courseStatus") {
            data.splice(8, 0, {
                $sort: { courseStatus: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "mentorName") {
            data.splice(8, 0, {
                $sort: { mentorName: parseInt(req.query.sortValue) }
            })
        }
        const course_data = await courseModel.aggregate(data);
        const ws = fs.createWriteStream("total_revenue.csv");
        fastcsv
            .write(course_data[0].data, { headers: true })
            .on("finish", function () {
                console.log("Write to CSV successfully!");
            })
            .pipe(ws);
        var total_earned = 0;
        var total_mentorRevenue = 0;
        var total_revenue = 0;
        for (let i = 0; i < course_data[0].data.length; i++) {
            total_earned += parseInt(course_data[0].data[i].earned);
            total_mentorRevenue += parseInt(course_data[0].data[i].mentorRevenue);
            total_revenue += parseInt(course_data[0].data[i].revenue);
        }
        res.status(200).send({
            data: {
                adminRevenue: course_data,
                total_earned,
                total_mentorRevenue,
                total_revenue,
            },
            message: "Order Details",
            status: 200,
        });
    } catch (error) {
        console.log(error, "error");
        res.status(400).send({
            error: error,
            message: "Error In Getting Order",
            status: 400,
        });
    }
};

exports.instructorPayouts = async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        let search = req.query.searchKey ? req.query.searchKey : "";
        const date1 = req.query.date + "T00:00:00.000Z";
        const date2 = req.query.date + "T23:59:59.999Z";
        var start = req.query.start + "T00:00:00.000Z";
        var end = req.query.end + "T23:59:59.999Z";
        var from = req.query.from + "T00:00:00.000Z";
        var to = req.query.to + "T23:59:59.999Z";
        let fil;
        let cat1;
        if (req.query.instructor) {
            fil = req.query.instructor;
            cat1 = fil.split(",");
        }
        var data;
        if (req.query.from && req.query.to) {
            data = [
                {
                    $lookup: {
                        from: "instructor",
                        localField: "instructor",
                        foreignField: "_id",
                        as: "mentor",
                    },
                },
                {
                    $unwind: { path: "$mentor", preserveNullAndEmptyArrays: true },
                },
                {
                    $lookup: {
                        from: "payment_logs", // total enrolled
                        localField: "_id",
                        foreignField: "courseId",
                        as: "orders",
                    },
                },
                {
                    $match: {
                        "orders.createdAt": {
                            $gte: new Date(from),
                            $lte: new Date(to)
                        }
                    }
                },
                {
                    $lookup: {
                        from: "userAuth",
                        localField: "mentor.userAuthId",
                        foreignField: "_id",
                        as: "userAuth",
                    },
                },
                {
                    $unwind: "$userAuth",
                },
                {
                    $lookup: {
                        from: "payouts", // instructorPayouts
                        localField: "_id",
                        foreignField: "courseId",
                        as: "payout",
                    },
                },
                {
                    $addFields: {
                        totalEnrolled: { $size: "$orders" },
                        total_payout: { $sum: "$payout.amount" },
                    },
                },
                {
                    $project: {
                        courseId: "$_id",
                        mentorId: "$mentor._id",
                        course_title: "$title",
                        course_price: "$offerPrice",
                        isDeleted: "$status",
                        instructor: "$userAuth.Name",
                        mentorPayout: "$mentor.revenue",
                        totalEnrolled: "$totalEnrolled",
                        total_amount: { $multiply: ["$offerPrice", "$totalEnrolled"] },
                        mentor_revenue: {
                            $multiply: [
                                { $multiply: ["$offerPrice", "$totalEnrolled"] },
                                { $divide: ["$mentor.revenue", 100] },
                            ],
                        },
                        // payout: "$payout",
                        pendingAmount: {
                            $subtract: [
                                {
                                    $multiply: [
                                        { $multiply: ["$offerPrice", "$totalEnrolled"] },
                                        { $divide: ["$mentor.revenue", 100] },
                                    ],
                                },
                                { $sum: "$payout.amount" },
                            ],
                        },
                        lastPaid: { $last: "$payout.createdAt" },
                    },
                },
                {
                    $match: {
                        $or: [
                            { instructor: { $regex: `${search}.*`, $options: "i" } },
                            { lastPaid: { $gte: new Date(date1), $lte: new Date(date2) } },
                        ],
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $facet: {
                        pagination: [
                            { $count: "total" },
                            { $addFields: { page: pageNumber } },
                        ],
                        data: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }], // add projection here wish you re-shape the docs
                    },
                },

            ];
        } else {
            data = [
                {
                    $lookup: {
                        from: "instructor",
                        localField: "instructor",
                        foreignField: "_id",
                        as: "mentor",
                    },
                },
                {
                    $unwind: { path: "$mentor", preserveNullAndEmptyArrays: true },
                },
                {
                    $lookup: {
                        from: "payment_logs", // total enrolled
                        localField: "_id",
                        foreignField: "courseId",
                        as: "orders",
                    },
                },
                {
                    $lookup: {
                        from: "payouts",
                        localField: "_id",
                        foreignField: "courseId",
                        as: "payout",
                    },
                },
                {
                    $lookup: {
                        from: "userAuth",
                        localField: "mentor.userAuthId",
                        foreignField: "_id",
                        as: "userAuth",
                    },
                },
                {
                    $unwind: "$userAuth",
                },
                {
                    $addFields: {
                        totalEnrolled: { $size: "$orders" },
                        total_payout: { $sum: "$payout.amount" },
                    },
                },
                {
                    $project: {
                        courseId: "$_id",
                        mentorId: "$mentor._id",
                        course_title: "$title",
                        course_price: "$offerPrice",
                        isDeleted: "$status",
                        instructor: "$userAuth.Name",
                        mentorPayout: "$mentor.revenue",
                        totalEnrolled: "$totalEnrolled",
                        total_amount: { $multiply: ["$offerPrice", "$totalEnrolled"] },
                        mentor_revenue: {
                            $multiply: [
                                { $multiply: ["$offerPrice", "$totalEnrolled"] },
                                { $divide: ["$mentor.revenue", 100] },
                            ],
                        },
                        // payout: "$payout",
                        pendingAmount: {
                            $subtract: [
                                {
                                    $multiply: [
                                        { $multiply: ["$offerPrice", "$totalEnrolled"] },
                                        { $divide: ["$mentor.revenue", 100] },
                                    ],
                                },
                                { $sum: "$payout.amount" },
                            ],
                        },
                        lastPaid: { $last: "$payout.createdAt" },
                    },
                },
                {
                    $match: {
                        $or: [
                            { instructor: { $regex: `${search}.*`, $options: "i" } },
                            { lastPaid: { $gte: new Date(date1), $lte: new Date(date2) } },
                        ],
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $facet: {
                        pagination: [
                            { $count: "total" },
                            { $addFields: { page: pageNumber } },
                        ],
                        data: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }], // add projection here wish you re-shape the docs
                    },
                },

            ];
        }
        if (req.query.instructor) {
            data.splice(7, 0, {
                $match: {
                    instructor: { $in: cat1 }
                },
            });
        }
        if (req.query.sort == "instructor") {
            data.splice(8, 0, {
                $sort: { instructor: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "course_title") {
            data.splice(8, 0, {
                $sort: { course_title: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "lastPaid") {
            data.splice(8, 0, {
                $sort: { lastPaid: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "pendingAmount") {
            data.splice(8, 0, {
                $sort: { pendingAmount: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "mentorPayout") {
            data.splice(8, 0, {
                $sort: { mentorPayout: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "isDeleted") {
            data.splice(8, 0, {
                $sort: { isDeleted: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "totalEnrolled") {
            data.splice(8, 0, {
                $sort: { totalEnrolled: parseInt(req.query.sortValue) }
            })
        }
        const instructor = await courseModel.aggregate(data);
        var total_enrolled = 0
        var total_pendingAmount = 0
        for (let i = 0; i < instructor[0].data.length; i++) {
            total_enrolled += parseInt(instructor[0].data[i].totalEnrolled);
            total_pendingAmount += parseInt(instructor[0].data[i].pendingAmount);
        }
        const ws = fs.createWriteStream("instructor_Payouts.csv");
        fastcsv
            .write(instructor[0].data, { headers: true })
            .on("finish", function () {
                console.log("Write to CSV successfully!");
            })
            .pipe(ws);
        res.status(200).send({
            data: instructor,
            total_enrolled: total_enrolled,
            total_pendingAmount: total_pendingAmount,
            error: null,
            status: 1,
            message: "Getting Instructor Payouts Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Getting Instructor Payouts",
        });
    }
};

exports.studentTransaction = async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
        const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
        const date1 = req.query.start + "T00:00:00.000Z";
        const date2 = req.query.end + "T23:59:59.999Z";
        let search = req.query.searchKey ? req.query.searchKey : "";
        var total = 0;
        // let fil ;
        // let cat1;
        if (req.query.course) {
            let fil = req.query.course;
            var cat1 = fil.split(",");
        }
        if (req.query.mentor) {
            let fil = req.query.mentor;
            var cat2 = fil.split(",");
        }
        if (req.query.courseType) {
            let fil = req.query.courseType;
            var cat3 = fil.split(",");
        }
        if (req.query.paymentMode) {
            let fil = req.query.paymentMode;
            var cat4 = fil.split(",");
        }
        if (req.query.enrolledBy) {
            let fil = req.query.enrolledBy;
            var cat5 = fil.split(",");
        }
        const orderAggregate = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "users",
                },
            },
            {
                $lookup: {
                    from: "userAuth",
                    localField: "users.userAuthId",
                    foreignField: "_id",
                    as: "userDet",
                },
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "courseId",
                    foreignField: "_id",
                    as: "courses",
                },
            },
            {
                $lookup: {
                    from: "instructor",
                    localField: "courses.instructor",
                    foreignField: "_id",
                    as: "mentors",
                },
            },
            {
                $lookup: {
                    from: "userAuth",
                    localField: "mentors.userAuthId",
                    foreignField: "_id",
                    as: "mentorDet",
                },
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "orderId",
                    as: "orders",
                },
            },
            {
                $unwind: { path: "$users", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$userDet",preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: "$mentorDet",preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: "$courses", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$mentors", preserveNullAndEmptyArrays: true },
            },
            {
                $unwind: { path: "$orders", preserveNullAndEmptyArrays: true },
            },
            {
                $addFields: {
                    fullName: "$userDet.Name",
                    phoneNumber: "$userDet.mobile_number",
                    mail: "$userDet.Email",
                    course: "$courses.title",
                    courseFee: "$courses.offerPrice",
                    instructor: "$mentorDet.Name",
                    paymentMode: "$orders.paymentMode",
                    enrolledBy: "$orders.enrolledBy",
                }
            },
            {
                $match: {
                    $or: [
                        { fullName: { $regex: `${search}.*`, $options: "i" } },
                        { phoneNumber: parseInt(req.query.searchKey) },
                        { mail: { $regex: `${search}.*`, $options: "i" } },
                        { orderId: { $regex: `${search}.*`, $options: "i" } },
                        { course: { $regex: `${search}.*`, $options: "i" } },
                        { courseType: { $regex: `${search}.*`, $options: "i" } },
                        { courseFee: { $regex: `${search}.*`, $options: "i" } },
                        { instructor: { $regex: `${search}.*`, $options: "i" } },
                        { paymentMode: { $regex: `${search}.*`, $options: "i" } },
                        { enrolledBy: { $regex: `${search}.*`, $options: "i" } }
                    ]
                },
            },
            {
                $unset: ["mentors", "orders", "users", "courses","userDet","mentorDet"],
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $facet: {
                    pagination: [
                        { $count: "total" },
                        { $addFields: { page: pageNumber } },
                    ],
                    data: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }], // add projection here wish you re-shape the docs
                },
            },
        ];
        if (req.query.start && req.query.end) {
            orderAggregate.splice(10, 0, {
                $match: { createdAt: { $gte: new Date(date1), $lte: new Date(date2) } },
            });
        }
        if (req.query.course) {
            orderAggregate.splice(10, 0, {
                $match: {
                    course: { $in: cat1 }
                }
            });
        }
        if (req.query.courseType) {
            orderAggregate.splice(10, 0, {
                $match: {
                    courseType: { $in: cat3 }
                },
            });
        }
        if (req.query.mentor) {
            orderAggregate.splice(10, 0, {
                $match: {
                    instructor: { $in: cat2 }
                }
            });
        }
        if (req.query.paymentMode) {
            orderAggregate.splice(10, 0, {
                $match: {
                    paymentMode: { $in: cat4 }
                },
            });
        }
        if (req.query.enrolledBy) {
            orderAggregate.splice(10, 0, {
                $match: {
                    enrolledBy: { $in: cat5 }
                },
            });
        }
        if (req.query.sort == "fullName") {
            orderAggregate.splice(12, 0, {
                $sort: { fullName: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "orderId") {
            orderAggregate.splice(12, 0, {
                $sort: { orderId: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "course") {
            orderAggregate.splice(12, 0, {
                $sort: { course: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "courseType") {
            orderAggregate.splice(12, 0, {
                $sort: { courseType: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "instructor") {
            orderAggregate.splice(12, 0, {
                $sort: { instructor: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "courseFee") {
            orderAggregate.splice(12, 0, {
                $sort: { courseFee: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "enrolledBy") {
            orderAggregate.splice(12, 0, {
                $sort: { enrolledBy: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "paymentMode") {
            orderAggregate.splice(12, 0, {
                $sort: { paymentMode: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "createdAt") {
            orderAggregate.splice(12, 0, {
                $sort: { createdAt: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "mail") {
            orderAggregate.splice(12, 0, {
                $sort: { mail: parseInt(req.query.sortValue) }
            })
        }
        if (req.query.sort == "phoneNumber") {
            orderAggregate.splice(12, 0, {
                $sort: { phoneNumber: parseInt(req.query.sortValue) }
            })
        }
        let order = await payment_logModel.aggregate(orderAggregate);
        for (let i = 0; i < order[0].data.length; i++) {
            total = total + parseInt(order[0].data[i].courseFee)
        }

        const ws = fs.createWriteStream("studentTransaction.csv");
        fastcsv
            .write(order[0].data, { headers: true })
            .on("finish", function () {
                console.log("Write to CSV successfully!");
            })
            .pipe(ws);
        res.status(200).send({
            data: { order: order[0].data, pagination: order[0].pagination[0], total },
            message: "Order Details",
            status: 200,
        });
    } catch (error) {
        console.log(error, "error");
        res.status(400).send({
            error: error,
            message: "Error In Getting Order",
            status: 400,
        });
    }
};