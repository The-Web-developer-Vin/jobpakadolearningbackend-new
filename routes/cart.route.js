const router = require("express").Router();
const cartController = require("../controllers/cart.controller");
const verifyUser = require("../middlewares/authentication")



router.post("/create-update-cart", verifyUser , cartController.create_update_cart);

router.get("/getcartById/:userId", verifyUser , cartController.cartGetById);

router.delete("/deleteCartItem/:cartId" , verifyUser , cartController.deleteCartItem)

module.exports = router;