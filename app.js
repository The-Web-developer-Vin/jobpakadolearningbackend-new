const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.APP_PORT;

const mongooseConfig = require("./config/mongoose");
const userRoute = require("./routes/user.route");
const adminRoute = require("./routes/admin.route");
const categoryRoute = require("./routes/category.route");
const instructorRoute = require("./routes/instructor.route");
const courseRoute = require("./routes/course.route");
const uploadRoute = require("./routes/upload.route");
const ratingRoute = require("./routes/rating.route");
const cartRoute = require("./routes/cart.route");
const wishListRoute = require("./routes/wishList.route");
const orderRoute = require("./routes/order.route")
const couponRoute = require("./routes/coupon.route")

app.use((req, res, next) => {
    const allowedOrigins = [
        "http://localhost:4200/"
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Origin", [
        "http://localhost:4200"
    ]);
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    return next();
});
app.use(cors());
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => res.send("WELCOME TO API HOME."));
app.use(express.static(`${__dirname}/`));
app.use("/api/v1/user" , userRoute);
app.use("/api/v1/admin" , adminRoute);
app.use("/api/v1/category" , categoryRoute);
app.use("/api/v1/instructor" , instructorRoute);
app.use("/api/v1/course" , courseRoute);
app.use("/api/v1/upload" , uploadRoute);
app.use("/api/v1/rating" , ratingRoute);
app.use("/api/v1/cart" , cartRoute);
app.use("/api/v1/wishList" , wishListRoute);
app.use("/api/v1/order" , orderRoute);
app.use("/api/v1/coupon" , couponRoute)

app.use((req , res, next) => {
    const error = new Error("Not found");
    error.message = "Invalid route";
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.json({
        error: {
            message: error.message
        }
    });
});
async function dbConnect() {
    try {
        await mongooseConfig.connectToServer();
        console.log("connected now to mongo db");
    } catch (error) {
        console.log("error in mongo connection", error);
    }
}

dbConnect();
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});  