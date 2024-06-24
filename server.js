const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const CategoryRoute = require("./routes/category");
const RestaurantRoute = require("./routes/restaurant");
const FoodRoute = require("./routes/food");
const AuthRoute = require("./routes/auth");
const UserRoute = require("./routes/user");
const AddressRoute = require("./routes/address");
const OrderRoute = require("./routes/order");
const PayoutRoute = require("./routes/payouts");
const DriverRoute = require("./routes/drivers");
const FeedBackRoute = require("./routes/feedback");
const CartRoute = require("./routes/cart");
const RatingRoute = require("./routes/rating");
const { fireBaseConnection } = require("./utils/fbConnect");
const generateOtp = require("./utils/otp_generator");
const { sendVerificationEmail } = require("./utils/driver_verification_email");
const { sendEmail, sendRejectionEmail } = require("./utils/smtp_function");
dotenv.config();

fireBaseConnection();

mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("Foodly Database Connected"))
  .catch((err) => console.log(err));

// const otp = generateOtp();
// console.log(otp);
// sendEmail('ayeshalatif55566@gmail.com', otp);
sendVerificationEmail("yeineraparicio@gmail.com", "Test User")
  .then(() => console.log("Test email sent"))
  .catch((error) => console.log("Test email sending failed: ", error));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/restaurant", RestaurantRoute);
app.use("/api/foods", FoodRoute);
app.use("/api/address", AddressRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/payouts", PayoutRoute);
app.use("/api/driver", DriverRoute);
app.use("/api/rating", RatingRoute);
app.use("/api/cart", CartRoute);

app.listen(process.env.PORT || 6013, () => console.log(`Foodly Backend is running on ${process.env.PORT}!`));
