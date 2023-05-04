const router = require("express").Router();
const instructorController = require("../controllers/instructor.controller");
const upload = require("../middlewares/upload");
const verify = require("../middlewares/authentication_admin");

router.post("/create_update", upload.any(), instructorController.create_update);
router.get("/list", verify, instructorController.getall);
router.delete("/del/:instructorId",verify, instructorController.deleteInstructor);
router.get("/:instructorId", instructorController.getbyId);

module.exports = router;