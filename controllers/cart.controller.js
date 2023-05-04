const mongoose = require("mongoose");
const cartModel = require("../models/cart.model");

exports.create_update_cart = async (req, res) => {
  try {
    const sameCartId = await cartModel.findOne({courseId : req.body.courseId , userId : req.userAuthId})
    if(sameCartId) {
        return res.status(400).send({
          data: null,
          status : 0,
          message :"This Course Already Added To Cart"
        })
    }
    const cart = req.body;
    const cartId = req.body.cartId && mongoose.isValidObjectId(req.body.cartId) ? req.body.cartId : new mongoose.Types.ObjectId();
    const cartCreated = await cartModel.findOneAndUpdate({ _id: cartId },  cart, { new: true, upsert: true });
    res.status(201).send({
      data: { cartData: cartCreated },
      error: null,
      status: 1,
      message: "Cart Updated Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in Updating the cart",
    });
  }
};

exports.cartGetById = async (req, res) => {
  try {
    var totalPrice = 0    
    const cart = await cartModel.find({ userId: req.params.userId }).populate({path : "courseId" , populate : "instructor" }).lean();
    for (let i = 0; i < cart.length; i++) {
      totalPrice = totalPrice + cart[i].courseId.offerPrice
    }
    const total = await cartModel.countDocuments({ userId: req.params.userId });   
    res.status(200).send({
      data: { cartId: cart , total: total , totalPrice : totalPrice},
      error: null,
      status: 1,
      message: "getting cart by id Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error In Getting The cart by id",
    });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const cart = await cartModel.findOneAndDelete({ _id : req.params.cartId }); 
    res.status(200).send({
      data: cart,
      error: null,
      status: 1,
      message: "Cart Item Deleted Sucessfully",
    });
  } catch (error) {
    res.status(400).send({
      data: null,
      error: error,
      status: 0,
      message: "Error in Deleting the Cart Item",
    });
  }
};