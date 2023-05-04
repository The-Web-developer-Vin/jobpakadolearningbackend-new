const mongoose = require("mongoose");
const wishListModel = require("../models/wishList.model");


exports.create_update_wishlist = async(req , res) => {

    try {
        const wishList = req.body;
        wishList.userId = req.userAuthId
        const wishListId = req.body.wishListId && mongoose.isValidObjectId(req.body.wishListId) ? req.body.wishListId : new mongoose.Types.ObjectId()
        const wishListCreated = await wishListModel.findOneAndUpdate({_id: wishListId } , wishList , {new: true , upsert: true});
        res.status(201).send({
            data: {wishListData : wishListCreated},
            error: null,
            status: 1,
            message: "WishList Created Sucessfully",
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error in Updating the WishList",
          }); 
    }
}



exports.wishListGetById = async (req , res) => {
    try {
        console.log("REquest.userAuthid" , req.userAuthId)
        const wishList = await wishListModel.find({ userId : req.params.userId}).populate({ path:"courseId" , populate:"instructor"  }).lean();
        const wishListTotal = await wishListModel.countDocuments({ userId : req.params.userId })
        res.status(201).send({
            data : {data : wishList , total : wishListTotal},
            error : null,
            stauts: 1 ,
            message: "Getting Wishlist by id Sucessfully",
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error in Getting the WishList By Id",
          });  
    }
}


exports.deleteWishListById = async (req , res) => {
    try {
        const wishList = await wishListModel.findOneAndDelete({ _id : req.params.wishListId});
        res.status(201).send({
           data: wishList,
           error : null,
           status: 1 ,
           message : "Wishlist Item Deleted Successfully"
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Deleting The Wishlist Item",
        })
    }
}