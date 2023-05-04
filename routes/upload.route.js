const router = require("express").Router();
const multer = require("multer");
const uploadController = require("../controllers/upload.controller");
const upload = require("../middlewares/upload");
const storage = multer.memoryStorage();
const awsUpload = multer({ storage: storage });


router.post('/create_update', upload.single('image'), uploadController.createUpdate);
router.post('/aws', awsUpload.single('file'), uploadController.awsUpload);

module.exports = router;