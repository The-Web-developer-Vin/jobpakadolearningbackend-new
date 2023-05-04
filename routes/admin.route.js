const router = require("express").Router();
const verify = require("../middlewares/authentication_admin");
const adminController = require("../controllers/admin.controller");

router.post("/signup", adminController.signup);

router.post("/login", adminController.login);

router.get("/list", verify, adminController.getAll);

router.delete("/:adminId",verify, adminController.delete_admin);

router.get("/dashboard", adminController.admin_dashboard);

router.get("/get/:adminId", adminController.getById);

router.get("/total/revenue", adminController.adminRevenue);

router.get("/instructor/Payouts", adminController.instructorPayouts);

router.get("/student/trans",adminController.studentTransaction);

module.exports = router;