const mongoose = require("mongoose");
const courseModel = require("../models/course.model");
const ratingModel = require("../models/rating.model");
const payment_logModel = require("../models/payment_log.model");
const wishListModel = require("../models/wishList.model");
const cartModel = require("../models/cart.model")

exports.create_update = async (req, res) => {
  try {
    const course = req.body;
    course.createdBy = req.name;
    const courseId =
      req.body.courseId && mongoose.isValidObjectId(req.body.courseId)
        ? req.body.courseId
        : new mongoose.Types.ObjectId();
    const courseCreated = await courseModel.findOneAndUpdate(
      { _id: courseId },
      course,
      { new: true, upsert: true }
    );
    res.status(201).send({
      data: { course: courseCreated },
      error: null,
      status: 1,
      message: "courses Update Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in Updating the courses",
    });
  }
};

exports.getById = async (req, res) => {
  try {
    var rate = 0;
    const course = await courseModel
      .findOne({ _id: req.params.courseId })
      .populate("courseCategory instructor")
      .lean();
    const rating = await ratingModel.find({ courseId: course._id });
    for (let j = 0; j < rating.length; j++) {
      rate = rate + rating[j].rating;
    }
    course.courseRating = rate / rating.length;
    course.courseReviews = rating.length;

    res.status(200).send({
      data: { course: course },
      error: null,
      status: 1,
      message: "getting course Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting The course",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const course = await courseModel.findOneAndDelete({
      _id: req.body.courseId,
    });
    res.status(200).send({
      data: course,
      error: null,
      status: 1,
      message: "courses Deleted Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in Deleting the courses",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    var rate = 0;
    const course = await courseModel.find().populate("courseCategory instructor").lean();
    const totalCourse = await courseModel.countDocuments()
    for (let i = 0; i < course.length; i++) {
      const rating = await ratingModel.find({ courseId: course[i]._id });
      const wishList = await wishListModel.findOne({ userId: req.query.userId , courseId:course[i]._id });
      const cartItem = await cartModel.findOne({ userId : req.query.userId , courseId: course[i]._id })
      if(wishList) {
        course[i].wishList = true
      }else {
        course[i].wishList = false
      }
      if(cartItem) {
        course[i].addedCart = true
      }else {
        course[i].addedCart = false
      }
      for (let j = 0; j < rating.length; j++) {
        rate = rate + rating[j].rating;
      }
      if (rating.length == 0) {
        course[i].courseRating = 0;
        course[i].courseReviews = 0;

      } else {
        course[i].courseRating = rate / rating.length;
        course[i].courseReviews = rating.length;

      }
      rate = 0;
    }
    res.status(200).send({
      data: { course: course , total :totalCourse },
      error: null,
      status: 1, 
      message: "getting course Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting The course",
    });
  }
};

exports.courseList = async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
    let search = req.query.searchKey ? req.query.searchKey : "";
    const courseAggregate = [
      {
        $lookup: {
          from: "category",
          localField: "courseCategory",
          foreignField: "_id",
          as: "cat"
        }
      },
      {
        $lookup: {
          from: "instructor",
          localField: "instructor",
          foreignField: "_id",
          as: "instruct"
        }
      },
      {
        $lookup: {
          from: "userAuth",
          localField: "instruct.userAuthId",
          foreignField: "_id",
          as: "userAuthData"
        }
      },
      {
        $unwind: { path: "$userAuthData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$cat", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$instruct", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          actualPrice: { $toString: "$actualPrice" },
          status: { $toString: "$status" },
          categoryName: "$cat.categoryName",
          instructorName: "$userAuthData.Name"
        }
      },
      {
        $match: {
          $or: [
            { instructorName: { $regex: `${search}.*`, $options: "i" } },
            { categoryName: { $regex: `${search}.*`, $options: "i" } },
            { title: { $regex: `${search}.*`, $options: "i" } },
            { actualPrice: { $regex: `${search}.*`, $options: "i" } },
            { status: { $regex: `${search}.*`, $options: "i" } },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $unset: ["cat","instruct", "userAuthData"]
      },
      {
        $facet: {
          pagination: [
            { $count: "total" },
            { $addFields: { page: pageNumber } },
          ],
          data: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }], // add projection here wish you re-shape the docs
        },
      }
    ]
    if (req.query.sort == "title") {
      courseAggregate.splice(9, 0, {
        $sort: { title: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "categoryName") {
      courseAggregate.splice(9, 0, {
        $sort: { categoryName: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "instructorName") {
      courseAggregate.splice(9, 0, {
        $sort: { instructorName: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "actualPrice") {
      courseAggregate.splice(9, 0, {
        $sort: { actualPrice: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "status") {
      courseAggregate.splice(9, 0, {
        $sort: { status: parseInt(req.query.sortValue) }
      })
    }
    let course = await courseModel.aggregate(courseAggregate);
    res.status(200).send({
      data: { course: course[0].data, pagination: course[0].pagination[0] },
      error: null,
      status: 1,
      message: "getting course successfully"
    })

  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting The course",
    });
  }
}

exports.getCourseByCategoryId = async (req , res) => {
  try {
    const courseCategory = await courseModel.find({courseCategory : req.params.categoryId}).populate("instructor");
    const totalCategory = await courseModel.countDocuments({courseCategory : req.params.categoryId});
    res.status(201).send({
      data:{ data : courseCategory , total : totalCategory},
      error : null,
      status: 1 ,
      message : "Getting Course By Category By Id Successfully"
    })
  } catch (error) {
    res.status(400).send({
      data : null ,
      error : error,
      status : 0 ,
      message : "Error In Getting Course By CategoryId"
    })
  }
}

exports.getMyCourseId = async (req , res) => {
  try {
    var courseArray = [];
    var rate = 0;
    const myCourse = await payment_logModel.find({ userId : req.userAuthId });
    for (let i = 0; i < myCourse.length; i++) {
      const courses = await courseModel.findOne({_id : myCourse[i].courseId }).lean();
      const rating = await ratingModel.find({ courseId: courses._id });
      for (let j = 0; j < rating.length; j++) {
        rate = rate + rating[j].rating;
      }
      if (rating.length == 0) {
        courses.courseRating = 0;
        courses.courseReviews = 0;

      } else {
        courses.courseRating = rate / rating.length;
        courses.courseReviews = rating.length;

      }
      courseArray.push(courses)
      rate = 0;
    }
    res.status(200).send({
      data : { data : courseArray , total : courseArray.length},
      error : null,
      status : 1,
      message : "Getting My courses by user id successfully"
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      data : null ,
      error : error,
      status : 0 ,
      message : "Error in Getting My Courses"
    })
  }
}