const router = require("express").Router();
const wishListController = require("../controllers/wishList.controller");
const verifyuser  = require("../middlewares/authentication")

router.post("/create_update_wishlist" , verifyuser , wishListController.create_update_wishlist);

router.get("/get_wishlist_by_id/:userId" , verifyuser , wishListController.wishListGetById);

router.delete("/delete_wishlist_by_id/:wishListId" , verifyuser , wishListController.deleteWishListById)

module.exports = router;