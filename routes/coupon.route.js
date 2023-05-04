const router = require("express").Router();
const couponcontroller = require("../controllers/coupon.controller");
const verifyUser = require("../middlewares/authentication")
const verifyAdmin = require("../middlewares/authentication_admin")

router.post("/create_update", verifyAdmin , couponcontroller.createOrUpdate);

router.get("/getAll", verifyAdmin , couponcontroller.getAll);

router.get("/id/:couponId", verifyUser , couponcontroller.getById);

router.delete("/couponId", verifyAdmin , couponcontroller.delete);

router.post("/applyCoupon", verifyUser , couponcontroller.applyCoupon);

module.exports = router;