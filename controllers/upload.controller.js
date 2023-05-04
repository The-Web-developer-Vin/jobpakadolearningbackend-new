const mongoose = require("mongoose");
const fs = require("fs");
const AWS = require('aws-sdk');
const uploadModel = require("../models/uploads.model");
const s3Client = new AWS.S3({
    accessKeyId: 'AKIATHZC5TTKWIKI7RFF',
    secretAccessKey: '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'
});

const uploadParams = {
    Bucket: 'learning-jobpakado',
    Key: '', // pass key
    Body: null, // pass file body
};

exports.createUpdate = async (req, res) => {
    try {
        const upload = req.body;
        upload.image = req.file.path;
        const uploadId = req.body.uploadId &&
            mongoose.isValidObjectId(req.body.uploadId) ?
            req.body.uploadId : new mongoose.Types.ObjectId();
        const uploadCreated = await uploadModel.findOneAndUpdate({ _id: uploadId }, upload, { new: true, upsert: true })
        res.status(201).send({
            data: uploadCreated,
            error: null,
            status: 1,
            message: "upload created successfully "
        })
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "error in creating uploads"
        })
    }
}

exports.awsUpload = async (req, res) => {
    try {
        const params = uploadParams;
        uploadParams.Key = req.file.originalname;
        uploadParams.Body = req.file.buffer;

        s3Client.upload(params, (err, data) => {
            if (err) {
                res.status(500).json({ error: "Error -> " + err });
            }
            res.json({
                message: 'File uploaded successfully', 'filename':
                    req.file.originalname, 'location': data.Location
            });
        });
    } catch (error) {
        res.status(400).send({
            data: null,
            error: error,
            status: 0,
            message: "error in creating uploads"
        })
    }
}