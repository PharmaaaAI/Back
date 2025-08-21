require("dotenv").config({ quiet: true });
const express = require("express");

const cors = require("cors");

const app = express();

const mongoose = require('mongoose');

app.use(cors());

const productRouter = require("./routes/products.routes");
const ordersRouter = require('./routes/orders.routes')
const httpStatusText = require("./utils/httpStatusText");
const signupLoginRouter = require("./routes/signupLogin.routes");
app.use(express.json());
app.use("/api", signupLoginRouter)
app.use("/api", productRouter)
app.use("/api/orders", ordersRouter)

// app.patch('/ss', async (req, res) => {
//     await Product.updateMany({}, {$unset: {inStock: true}})
//     res.status(200).json("Done")
// })

const url = process.env.MONGO_URI;

mongoose.connect(url).then(() => {
    console.log("mongoose server started");
})
// global middleware for not found router
app.all(/.*/, (req, res) => {
  res.status(404).json({ message: "URL Not Found" });
});


// global error handler
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({status: error.httpStatusText || httpStatusText.ERROR, data: null, message: error.message, code: error.statusCode || 500});
})

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("listining on port " + port);
})
