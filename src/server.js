const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./database/database");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 8000;
const bodyParser = require("body-parser");
const passport = require("passport");
//route
const productRoutes = require("./routes/productRoute");
// const categoryRoutes = require("./routes/categoryRoute");
// const inventoryRoutes = require("./routes/inventoryRoute");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute")
const app = express();

const session = require("express-session");
const path = require("path");
app.use(bodyParser.json());

app.use(
  session({
    secret: "your-secret-key",  // Sử dụng một chuỗi bí mật
    resave: false,  // Không lưu lại session nếu không có thay đổi
    saveUninitialized: true,  // Lưu lại session mới mặc dù chưa được sử dụng
    cookie: { secure: true },  // Đặt secure: true nếu bạn sử dụng HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

//middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173",methods: "GET,POST,PUT,DELETE", credentials: true }));

//route
app.use("/products", productRoutes);
// app.use("/categories", categoryRoutes);
// app.use("/inventories", inventoryRoutes);
app.use("/", userRoute);
app.use("/admin", adminRoute);

app.listen(port, '0.0.0.0',() => {
  console.log(`server is working on port: ${port}`);
  connectDb();
});
