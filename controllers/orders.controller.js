const orderModel = require("../models/orders.model");

exports.create = async (req, res) => {
    try {
        const schema = new orderModel(req.body);
        schema.userId = req.userAuthId;
        schema.courseId = req.body.courseId;
        schema.status = req.body.status;
        schema.amount = req.body.amount;
        schema.orderId = req.body.orderId;
        const order = await orderModel.create(schema);
        res.status(201).send({
            data: order,
            error: null,
            status: 1,
            message: "Creating Order Successfully",
        });
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In Creating Order",
        });
    }
};

exports.getByUserId = async(req,res)=>{
    try {
        const order = await orderModel.find({userId:req.params.userId}).populate({path:"courseId",select:{title:1}})
        res.status(200).send({
            data: order,
            error: null,
            status: 1,
            message: "getting Order Successfully",
        });
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "Error In getting Order",
        });
    }
}