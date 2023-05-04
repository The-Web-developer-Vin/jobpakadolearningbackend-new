const router = require("express").Router();
const orderController = require("../controllers/orders.controller");
const verify = require("../middlewares/authentication");



router.post("/create" , verify , orderController.create);

router.get('/orderBy/:userId' , verify , orderController.getByUserId);


module.exports = router;