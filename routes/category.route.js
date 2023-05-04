const router = require("express").Router();
const categorycontroller = require("../controllers/category.controller");
const upload = require("../middlewares/upload");
const verifyAdmin = require("../middlewares/authentication_admin")
const verifyUser = require("../middlewares/authentication")


router.post("/create_update",upload.single('image') , verifyAdmin , categorycontroller.create_update);

router.get("/getAll", verifyAdmin ,categorycontroller.getAll);

router.get("/:categoryId", verifyUser , categorycontroller.getById);

router.delete("/delete_category", verifyUser , categorycontroller.delete);

router.get('/category/List' , categorycontroller.categoryList);

module.exports = router;