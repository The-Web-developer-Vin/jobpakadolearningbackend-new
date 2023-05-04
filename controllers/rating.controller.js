const mongoose = require("mongoose");
const ratingModel = require("../models/rating.model");
const payment_logModel = require("../models/payment_log.model");

exports.createandupdate = async (req,res ) => {
  try {
    const payment_log = await payment_logModel.findOne({ userId: req.body.userId,courseId:req.body.courseId })
    if (payment_log) {
      const rate = req.body;
      rate.userId = req.userAuthId;
      const ratingId =
        req.body.ratingId && mongoose.isValidObjectId(req.body.ratingId)
          ? req.body.ratingId
          : new mongoose.Types.ObjectId();
      const rating = await ratingModel.findOneAndUpdate(
        { _id: ratingId },
        rate,
        {new: true,upsert: true}
      );
      res.status(201).send({
        data: rating,
        error: null,
        status: 1,
        message: "Creating Rating Successfully",
      });
    } else {
      res.status(200).send({
        status: 1,
        message: "Please Purchase Course",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Creating Rating",
    });
  }
};

exports.getall = async (
  req,
  res // get all data in rating
) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber
      ? parseInt(req.query.pageNumber)
      : 1;
    const rating = await ratingModel
      .find()
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ _id: -1 });
    const count = await ratingModel.countDocuments();
    res.status(200).send({
      data: { ratings: rating, count: count },
      error: null,
      status: 1,
      message: "Getting Ratings Successfully ",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting Ratings",
    });
  }
};

exports.getbyId = async (
  req,
  res // get data by using id's
) => {
  try {
    const rating = await ratingModel.findOne({ _id: req.params.ratingId });
    res.status(200).send({
      data: rating,
      error: null,
      status: 1,
      message: "Getting Rating Successfully ",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting Rating",
    });
  }
};

exports.delete = async (
  req,
  res // to delete the rating
) => {
  try {
    const rating = await ratingModel.findOneAndDelete({
      _id: req.body.ratingId,
    });
    res.status(200).send({
      data: rating,
      error: null,
      status: 1,
      message: "Deleting Rating Successfully ",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Deleting Rating",
    });
  }
};

exports.getbycourseId = async (req, res) => {
  try {
    var courseRate = 0;
    const rating = await ratingModel.find({ courseId: req.params.courseId }).populate("userId");
    for (let i = 0; i < rating.length; i++) {
      courseRate = courseRate + rating[i].rating;
    }
    var count = rating.length;
    courseRate = courseRate / count;
    res.status(200).send({
      data: rating,courseRate,count,
      error: null,
      status: 1,
      message: "Getting Rating Successfully ",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting Rating",
    });
  }
};