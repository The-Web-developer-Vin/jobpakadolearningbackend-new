const router = require("express").Router();
const ratingController = require("../controllers/rating.controller");
const verify = require("../middlewares/authentication");

router.post("/create_update",verify, ratingController.createandupdate);

router.get("/getall", ratingController.getall);

router.get("/:ratingId", ratingController.getbyId);

router.delete("/delete",verify, ratingController.delete);

router.get("/rating/:courseId",ratingController.getbycourseId);

module.exports = router;
