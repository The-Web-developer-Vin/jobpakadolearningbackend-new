const mongoose = require("mongoose");
const couponModel = require("../models/coupon.model");
const otpGenerator = require("otp-generator");

exports.createOrUpdate = async (req, res) => {
  try {
    const coupon = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const couponData = req.body;
    couponData.couponcode = coupon;
    const couponId =
      req.body.couponId && mongoose.isValidObjectId(req.body.couponId)
        ? req.body.couponId
        : new mongoose.Types.ObjectId();
    const couponCreate = await couponModel.findOneAndUpdate(
      { _id: couponId },
      couponData,
      { new: true, upsert: true }
    );
    res.status(201).send({
      data: { coupon: couponCreate },
      error: null,
      status: 1,
      message: "Coupon Created Successfully",
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: " Error In Creating Coupon",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
    let search = req.query.searchKey ? req.query.searchKey : "";
    const couponAggregate = [
      {
        $match: {
          $or: [
            { name: { $regex: `${search}.*`, $options: "i" } },
            { type: { $regex: `${search}.*`, $options: "i" } },
            { validity: { $regex: `${search}.*`, $options: "i" } },
            { couponAmount: parseInt(req.query.searchKey) },
            { couponcode: { $regex: `${search}.*`, $options: "i" } },
            { minAmount: parseInt(req.query.searchKey) },
            { userUsed: { $regex: `${search}.*`, $options: "i" } },
            { couponFor: { $regex: `${search}.*`, $options: "i" } },
            { usedCoupon: { $regex: `${search}.*`, $options: "i" } },
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
    if (req.query.sort == "couponcode") {
      couponAggregate.splice(2, 0, {
        $sort: { couponcode: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "validity") {
      couponAggregate.splice(2, 0, {
        $sort: { validity: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "name") {
      couponAggregate.splice(2, 0, {
        $sort: { name: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "couponAmount") {
      couponAggregate.splice(2, 0, {
        $sort: { couponAmount: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "minAmount") {
      couponAggregate.splice(2, 0, {
        $sort: { minAmount: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "type") {
      couponAggregate.splice(2, 0, {
        $sort: { type: parseInt(req.query.sortValue) }
      })
    }
    if (req.query.sort == "usedCoupon") {
      couponAggregate.splice(2, 0, {
        $sort: { usedCoupon: parseInt(req.query.sortValue) }
      })
    }
    let couponDetails = await couponModel.aggregate(couponAggregate);
    res.status(200).send({
      data: couponDetails,
      message: "Coupon Details",
      status: 200,
    });
  } catch (error) {
    res.status(400).send({
      error: error,
      message: "Error In Geting Coupon",
      status: 400,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const coupon = await couponModel.findOne({ _id: req.params.couponId });
    res.status(200).send({
      data: { coupon: coupon },
      error: null,
      status: 1,
      message: "Coupon Collected Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting The Coupon",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const coupon = await couponModel.findOneAndDelete({
      _id: req.body.couponId,
    });

    res.status(200).send({
      data: coupon,
      error: null,
      status: 1,
      message: "Deleting Coupon Successfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Deleting The Coupon",
    });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
     const coupon = await couponModel.findOne({ couponcode: req.body.couponcode })
     const couponUsers = coupon.userUsed;
     if (couponUsers.length > 0) {
      const data1 = couponUsers.indexOf(req.userAuthId);
      console.log(data1,"hhj")
      if (data1 == -1) {
        couponUsers.push(req.userAuthId);
      } else {
        return res.status(400).send({
          data: null,
          message: "Coupon Already Used",
        });
      }
    } else {
      couponUsers.push(req.userAuthId);
    }
    if (coupon) {
      const date = new Date(Date.now());
      if (date <= coupon.validity) {
        const couponUpdate = await couponModel.findOneAndUpdate({ _id: coupon._id },{ userUsed: couponUsers },{ new: true });
        res.status(200).send({
          data:couponUpdate,
          error:null,
          status:1,
          message:"coupon is valid"
        })
      } else {
        res.status(400).send({
          data: null,
          status: 0,
          message: "Coupon is Expired",
        });
      }
    }else {
      res.status(400).send({
        data: null,
        status: 0,
        message: "Coupon is Not Valid",
      });
    }
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In applied Coupon",
    });
  }
}

