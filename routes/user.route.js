const router = require("express").Router();
const usercontroller = require("../controllers/user.controller");
const upload = require("../middlewares/upload");
const verify = require("../middlewares/authentication_admin");

router.post("/send_sms", usercontroller.send_sms);

router.post("/verify_sms", usercontroller.verify_sms);

router.post("/createupdate", upload.single('profilePhoto'), usercontroller.createUpdate);

router.post("/userDetails",usercontroller.userDetails);

router.get("/users",verify, usercontroller.getall);

router.delete("/del/:userId",verify,usercontroller.deleteUser);

router.get("/get/:userId", usercontroller.getbyId);

module.exports = router;