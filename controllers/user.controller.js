const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const userAuthModel = require("../models/userAuth.model");
const sms = require("../middlewares/sendSMS");
const instructorModel = require("../models/instructor.model");
const fs = require("fs");
const fastcsv = require("fast-csv");
const mongoose = require("mongoose");

exports.send_sms = async (req, res) => {
  try {
    const mobile_number = req.body.mobile_number;
    const get_user = await userAuthModel.findOne({mobile_number: mobile_number});
    const randomno = Math.floor(100000 + Math.random() * 900000);
    const sms1 = await sms.sendSmsSNS(`91${req.body.mobile_number}`, randomno);
    if (get_user) {
      const update_user = await userAuthModel.findOneAndUpdate(
        { _id: get_user._id },
        { verifyOtp: randomno },
        { new: true }
      );
      res.status(201).send({
        data: { mobile_number: req.body.mobile_number },
        status: 1,
        message: "OTP sent successfully",
      });
    } else {
      const schema = new userAuthModel(req.body);
      schema.verifyOtp = randomno;
      schema.save();
      res.status(201).send({
        data: { mobile_number: req.body.mobile_number },
        status: 1,
        message: "OTP sent successfully",
      });
    }
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "error in sending sms",
    });
  }
};

exports.verify_sms = async (req, res) => {
  try {
    const mobile_number = req.body.mobile_number;
    const code = req.body.code;
    const find_num = await userAuthModel.findOne({mobile_number: mobile_number});
    if (find_num) {
      if (find_num.verifyOtp == code) {
        const token = jwt.sign(
          { _id: find_num._id, name: find_num.Name },
          process.env.JWT_TOKEN_KEY,
          {
            expiresIn: "24h",
          }
        );
        res.status(201).send({
          data: {
            mobile_number: find_num.mobile_number,
            newUser: find_num.newUser,
            _id: find_num._id,
            token: token,
            Name: find_num.Name,
            email: find_num.Email,
            city: find_num.city,
            role: find_num.role,
          },
          error: null,
          status: 1,
          message: " User Verified Successfully",
        });
      } else {
        res.status(400).send({
          status: 0,
          message: "Invalid OTP",
        });
      }
    } else {
      res.status(400).send({
        status: 0,
        message: "Please Try Again",
      });
    }
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Verify SMS",
    });
  }
};

exports.createUpdate = async (req, res) => {
  try {
    const user = req.body;
    // user.newUser = false;
    if (!req.body.userId) {
      const schema = new userAuthModel();
      schema.newUser = false;
      schema.Name = req.body.Name;
      schema.Email = req.body.Email;
      schema.city = req.body.city;
      schema.role = "User";
      schema.mobile_number = req.body.mobile_number;
      const createUser = await schema.save();
      user.userAuthId = createUser._id;
    }
    if (req.body.userAuthId) {
      const update = await userAuthModel.findOneAndUpdate(
        { _id: req.body.userAuthId },
        req.body,
        { new: true}
      );
    }
    if (req.file) {
      user.profilePhoto = req.file.path;
    }
    const userId =
      req.body.userId && mongoose.isValidObjectId(req.body.userId)
        ? req.body.userId
        : new mongoose.Types.ObjectId();
    const userCreated = await userModel.findOneAndUpdate(
      { _id: userId },
      user,
      { new: true, upsert: true }
    );
    res.status(201).send({
      data: userCreated,
      error: null,
      status: 1,
      message: "User Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Creating User",
    });
  }
};

exports.userDetails = async (req, res) => {
  try {
    const body = req.body;
    body.newUser = false;
    body.Name = req.body.name;
    body.Email = req.body.email;
    body.city = req.body.city;
    body.whatsapp = req.body.whatsapp;
    const updateUser = await userAuthModel.findOneAndUpdate({ _id: req.body.userAuthId },body,{ new: true });
    const token = jwt.sign({ _id: updateUser._id, name: updateUser.Name },process.env.JWT_TOKEN_KEY,{ expiresIn: "24h" });
    if (req.body.role == "User") {
      const schema = new userModel();
      // schema.name = req.body.name;
      // schema.Email = req.body.email;
      // schema.city = req.body.city;
      // schema.whatsapp = req.body.whatsapp;
      schema.userAuthId = req.body.userAuthId;
      const createUser = await schema.save();
    }
    if (req.body.role == "Instructor") {
      const schema = new instructorModel();
      // schema.name = req.body.name;
      // schema.Email = req.body.email;
      // schema.city = req.body.city;
      // schema.whatsapp = req.body.whatsapp;
      schema.userAuthId = req.body.userAuthId;
      const createUser = await schema.save();
    }
    res.status(201).send({
      data: updateUser,token,
      error: null,
      status: 1,
      message: "User details created Successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "error in creating user details",
    });
  }
};

exports.getall = async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber
      ? parseInt(req.query.pageNumber)
      : 1;
    const date1 = req.query.start + "T00:00:00.000Z";
    const date2 = req.query.end + "T23:59:59.999Z";
    let search = req.query.searchKey ? req.query.searchKey : "";
    // let fil;
    // let cat1;
    // if (req.query.courseEnrolled) {
    //     fil = req.query.courseEnrolled;
    //     cat1 = fil.split(",");
    // }
    // if (req.query.paymentMode) {
    //     fil = req.query.paymentMode;
    //     cat1 = fil.split(",");
    // }
    // if (req.query.enrolledBy) {
    //     fil = req.query.enrolledBy;
    //     cat1 = fil.split(",");
    // }
    const userAggregate = [
      // {
      //     $lookup: {
      //         from: "payment_logs",
      //         localField: "_id",
      //         foreignField: "userId",
      //         as: "courseEnrolled",
      //     },
      // },
      // {
      //     $lookup: {
      //         from: "courses",
      //         localField: "courseEnrolled.courseId",
      //         foreignField: "_id",
      //         as: "course",
      //     },
      // },
      // {
      //     $lookup: {
      //         from: "razorpay_orders",
      //         localField: "courseEnrolled.orderId",
      //         foreignField: "orderId",
      //         as: "orders",
      //     },
      // },
      {
        $lookup: {
          from: "userAuth",
          localField: "userAuthId",
          foreignField: "_id",
          as: "userAuthData",
        },
      },
      {
        $unwind: { path: "$userAuthData", preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          $or: [
            { "userAuthData.Name": { $regex: `${search}.*`, $options: "i" } },
            { "userAuthData.Email": { $regex: `${search}.*`, $options: "i" } },
            { "userAuthData.mobile_number": parseInt(search) },
            { "userAuthData.city": { $regex: `${search}.*`, $options: "i" } },
            // { "courseEnrolled.createdAt": { $regex: `${search}.*`, $options: "i" } },
            // { "orders.paymentMode": { $regex: `${search}.*`, $options: "i" } },
            // { "orders.enrolledBy": { $regex: `${search}.*`, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          name: "$userAuthData.Name",
          email: "$userAuthData.Email",
          mobileNumber: "$userAuthData.mobile_number",
          createdAt:"$createdAt"
          // profilePhoto: "$profilePhoto",
          // Name: "$Name",
          // mobile_number: "$mobile_number",
          // Email: "$Email",
          // city: "$city",
          // // coursesEnrolled:"$razor.course.course_title",
          // dateOfEnrolled: "$createdAt",
          // resume: "$resume",
          // // paymentMode:"$razor.paymentMode",
          // // enrolledBy:"$razor.enrolledBy",
          // courseEnrolled: "$course.course_title",
          // enrolledDate: { $first: "$courseEnrolled.createdAt" },
          // paymentMode: { $first: "$orders.paymentMode" },
          // enrolledBy: { $first: "$orders.enrolledBy" }
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
    // if (req.query.start && req.query.end) {
    //     // const date1 = req.query.date + "T00:00:00.000Z";
    //     // const date2 = req.query.date + "T23:59:59.999Z";
    //     userAggregate.splice(5, 0, {
    //         $match: { enrolledDate: { $gte: new Date(date1), $lte: new Date(date2) } },
    //     });
    // }
    // if (req.query.courseEnrolled) {
    //     userAggregate.splice(5, 0, {
    //         $match: {
    //             $or: [
    //                 { courseEnrolled: { $in: cat1 } },
    //                 { courseEnrolled: { $regex: `${req.query.courseEnrolled}.*`, $options: "i" } }
    //             ]
    //         }
    //     });
    // }
    // if (req.query.paymentMode) {
    //     userAggregate.splice(5, 0, {
    //         $match: {
    //             $or: [
    //                 { paymentMode: { $in: cat1 } },
    //                 { paymentMode: { $regex: `${req.query.paymentMode}.*`, $options: "i" } }
    //             ]
    //         },
    //     });
    // }
    // if (req.query.enrolledBy) {
    //     userAggregate.splice(5, 0, {
    //         $match: {
    //             enrolledBy: { $in: cat1 }
    //         },
    //     });
    // }
    if (req.query.sort == "Name") {
      userAggregate.splice(5, 0, {
        $sort: { name: parseInt(req.query.sortValue) },
      });
    }
    if (req.query.sort == "Email") {
      userAggregate.splice(5, 0, {
        $sort: { email: parseInt(req.query.sortValue) },
      });
    }
    if (req.query.sort == "mobile_number") {
      userAggregate.splice(5, 0, {
        $sort: { mobileNumber: parseInt(req.query.sortValue) },
      });
    }
    if (req.query.sort == "city") {
      userAggregate.splice(5, 0, {
        $sort: { city: parseInt(req.query.sortValue) },
      });
    }
     if (req.query.sort == "dateOfEnrolled") {
        userAggregate.splice(5, 0, {
            $sort: { createdAt: parseInt(req.query.sortValue) }
        })
    }
    // if (req.query.sort == "paymentMode") {
    //     userAggregate.splice(5, 0, {
    //         $sort: { paymentMode: parseInt(req.query.sortValue) }
    //     })
    // }
    // if (req.query.sort == "enrolledBy") {
    //     userAggregate.splice(5, 0, {
    //         $sort: { enrolledBy: parseInt(req.query.sortValue) }
    //     })
    // }

    let userDetails = await userModel.aggregate(userAggregate);
    const ws = fs.createWriteStream("manage_students.csv");
    fastcsv
      .write(userDetails[0].data, { headers: true })
      .on("finish", function () {
        console.log("Write to CSV successfully!");
      })
      .pipe(ws);
    res.status(200).send({
      data: {
        userDetails: userDetails[0].data,
        pagination: userDetails[0].pagination[0],
      },
      message: "User Details",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error,
      message: "Error In Geting User",
      status: 400,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userModel.findOneAndDelete({
      _id: req.params.userId,
    });
    if (user) {
      const userDelete = await userAuthModel.findOneAndDelete({
        _id: user.userAuthId,
      });
    }
    if (user.profilePhoto) {
      fs.unlink(user.profilePhoto, (err) => {
        if (err) throw err;
      });
    }
    res.status(200).send({
      data: user,
      error: null,
      status: 1,
      message: "Deleting user successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "error in deleting user",
    });
  }
};

exports.getbyId = async (req, res) => {
  try {
    const user = await userModel
      .findOne({ _id: req.params.userId })
      .populate("userAuthId");
    res.status(200).send({
      data: user,
      error: null,
      status: 1,
      message: "Getting User Successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "error in getting user",
    });
  }
};
