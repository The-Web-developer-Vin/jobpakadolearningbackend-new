const mongoose = require("mongoose");
const instructorModel = require("../models/instructor.model");
const userAuthModel = require("../models/userAuth.model");
const fs = require("fs");
const fastcsv = require("fast-csv");

exports.create_update = async (req, res) => {
  try {
    const instructor = req.body;
    if(!req.body.instructorId){
      const schema = new userAuthModel();
      schema.newUser = false;
      schema.Name = req.body.name;
      schema.Email = req.body.email;
      schema.city = req.body.city;
      schema.mobile_number = req.body.mobile_number;
      schema.role == "Instructor" 
      const createUser = await schema.save();
      instructor.userAuthId = createUser._id
    }
    if (req.body.userAuthId) {
      const update = await userAuthModel.findOneAndUpdate(
        { _id: req.body.userAuthId },
        req.body,
        { new: true}
      );
    }
    for (let i = 0; i < req.files.length; i++) {
      if (req.files[i].fieldname == "image") {
        instructor.image = req.files[i].path;
      }
      if (req.files[i].fieldname == "uploadResume") {
        instructor.uploadResume = req.files[i].path;
      }
    }
    instructor.role = req.body.designation
    const instructorId =
      req.body.instructorId && mongoose.isValidObjectId(req.body.instructorId)
        ? req.body.instructorId
        : new mongoose.Types.ObjectId();
    const instructorCreated = await instructorModel.findOneAndUpdate(
      { _id: instructorId },
      instructor,
      { new: true, upsert: true }
    );
    res.status(201).send({
      data: { instructor: instructorCreated },
      error: null,
      status: 1,
      message: "instructors Update Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in Updating the instructors",
    });
  }
};

exports.getall = async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber
      ? parseInt(req.query.pageNumber)
      : 1;
    const year = req.query.year ? parseInt(req.query.year) : null;
    const month = req.query.month ? parseInt(req.query.month) : null;
    let search = req.query.searchKey ? req.query.searchKey : "";
    const data = [
      {
        $addFields: {
          monthDOJ: {
            $dateToString: { format: "%m", date: "$createdAt" },
          },
          yearDOJ: {
            $dateToString: { format: "%Y", date: "$createdAt" },
          },
        },
      },
      {
        $addFields: {
          monthDOJ: { $toInt: "$monthDOJ" },
          yearDOJ: { $toInt: "$yearDOJ" },
        },
      },
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
            { role: { $regex: `${search}.*`, $options: "i" } },
            { description: { $regex: `${search}.*`, $options: "i" } },
            { name_as_per_bank: { $regex: `${search}.*`, $options: "i" } },
            { bankName: { $regex: `${search}.*`, $options: "i" } },
            { accountnumber: parseInt(search) },
            { ifsc_code: { $regex: `${search}.*`, $options: "i" } },
            { upi_id: { $regex: `${search}.*`, $options: "i" } },
            { revenue: { $regex: `${search}.*`, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          name: "$userAuthData.Name",
          email: "$userAuthData.Email",
          mobileNumber: "$userAuthData.mobile_number",
          // revenue: "$revenue",
          role: "$role",
          image: "$image",
        },
      },
      {
        $sort: { createdAt: -1 }
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
    if (year) {
      data.splice(4, 0, {
        $match: { yearDOJ: year },
      });
    }
    if (month) {
      data.splice(4, 0, {
        $match: { monthDOJ: month, yearDOJ: year },
      });
    }
    if (req.query.sort == "image") {
      data.splice(6, 0, {
        $sort: { image: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "name") {
      data.splice(6, 0, {
        $sort: { name: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "mobileNumber") {
      data.splice(6, 0, {
        $sort: { mobileNumber: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "role") {
      data.splice(6, 0, {
        $sort: { role: parseInt(req.query.sortValue) }
      })
    }
    const instructor = await instructorModel.aggregate(data);
    const ws = fs.createWriteStream("manage_instructor.csv");
    fastcsv
      .write(instructor[0].data, { headers: true })
      .on("finish", function () {
        console.log("Write to CSV successfully!");
      })
      .pipe(ws);
    res.status(200).send({
      data: { instructor: instructor[0].data, pagination: instructor[0].pagination[0] },
      error: null,
      status: 1,
      message: "Getting instructors Successfully",
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting instructors",
    });
  }
};

exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await instructorModel.findOneAndDelete({
      _id: req.params.instructorId,
    });
    if (instructor) {
      const userDelete = await userAuthModel.findOneAndDelete({ _id: instructor.userAuthId })
    }
    if (instructor.image) {
      fs.unlink(instructor.image, (err) => {
        if (err) throw err;
      });
    }
    res.status(200).send({
      data: instructor,
      error: null,
      status: 1,
      message: "Deleting instructor successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "error in deleting instructor",
    });
  }
};

exports.getbyId = async (req, res) => {
  try {
    const instructor = await instructorModel.findOne({ _id: req.params.instructorId }).populate("userAuthId");
    res.status(200).send({
      data: instructor,
      error: null,
      status: 1,
      message: "Getting instructor Successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting instructor",
    });
  }
};