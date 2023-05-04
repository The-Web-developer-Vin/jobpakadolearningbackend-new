const router = require("express").Router();
const courseController = require("../controllers/course.controller");
const verify = require("../middlewares/authentication_admin");
const verifyUser = require("../middlewares/authentication")


router.post("/create_update", verify, courseController.create_update);

router.get("/course_get/:courseId", courseController.getById);

router.delete("/course_delete", courseController.delete);

router.get("/getAll",  courseController.getAll);

router.get("/list", courseController.courseList);

router.get("/get_course_by_category/:categoryId" , courseController.getCourseByCategoryId);

router.get("/getMyCoursesByUserId" , verifyUser , courseController.getMyCourseId)

module.exports = router;