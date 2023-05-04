const mongoose = require("mongoose");
const categoryModel = require("../models/category.model");
const courseModel = require("../models/course.model");

exports.create_update = async (req, res) => {
  try {
    const category = req.body;
    if (req.file) {
      category.image = req.file.path;
    }
    const categoryId =
      req.body.categoryId && mongoose.isValidObjectId(req.body.categoryId)
        ? req.body.categoryId
        : new mongoose.Types.ObjectId();
    const categoryCreated = await categoryModel.findOneAndUpdate(
      { _id: categoryId },
      category,
      { new: true, upsert: true }
    );
    res.status(201).send({
      data: { category: categoryCreated },
      error: null,
      status: 1,
      message: "Categorys Update Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in Updating the Categorys",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber
      ? parseInt(req.query.pageNumber)
      : 1;
    const date1 = req.query.date + "T00:00:00.000Z";
    const date2 = req.query.date + "T23:59:59.999Z";

    let search = req.query.searchKey ? req.query.searchKey : "";
    const categoryAggregate = [
      {
        $match: {
          $or: [{ categoryName: { $regex: `${search}.*`, $options: "i" } },
          { createdAt: { $gte: new Date(date1), $lte: new Date(date2) } }
          ],
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
    if (req.query.sort == "categoryName") {
      categoryAggregate.splice(2, 0, {
        $sort: { categoryName: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "createdAt") {
      categoryAggregate.splice(2, 0, {
        $sort: { createdAt: parseInt(req.query.sortValue) }
      })
    }
    let adminDetails = await categoryModel.aggregate(categoryAggregate);
    res.status(200).send({
      data: adminDetails,
      error: null,
      status: 1,
      message: "Category Details"
    });
  } catch (error) {
    res.status(400).send({
      error: error,
      message: "Error In Geting Category",
      status: 400,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ _id: req.params.categoryId });
    res.status(200).send({
      data: { category: category },
      error: null,
      status: 1,
      message: "getting category Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting The Category",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const category = await categoryModel.findOneAndDelete({
      _id: req.body.categoryId,
    });
    res.status(200).send({
      data: category,
      error: null,
      status: 1,
      message: "Categorys Deleted Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in Deleting the Categorys",
    });
  }
};

exports.categoryList = async (req, res) => {
  try {
    const category = await categoryModel.find().lean();
    for (let i = 0; i < category.length; i++) {
      const course = await courseModel.countDocuments({ courseCategory: category[i]._id })
      category[i].courses = course;
    }
    res.status(200).send({
      data: category,
      error: null,
      status: 1,
      message: "Category getting successfully"
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in getting the Categorys",
    });
  }
}