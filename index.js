require("dotenv").config({ quiet: true });
const express = require("express");

const cors = require("cors");

const app = express();

const mongoose = require('mongoose');

const passport = require("passport");
const session = require("express-session");
const passportSetup = require("./utils/passport_setup")

// Session middleware
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Passport setup
passport.use(passportSetup);

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});


app.use(express.json());
app.use(cors());

const productRouter = require("./routes/products.routes.js");
const ordersRouter = require('./routes/orders.routes.js')
const signupLoginRouter = require("./routes/signupLogin.routes.js");
const categoriesRouter = require('./routes/categories.route.js')
const httpStatusText = require("./utils/httpStatusText.js");
const RecommendationService = require("./routes/chat.routes.js");

app.use("/api/users", signupLoginRouter)
app.use("/api/products", productRouter)
app.use("/api/orders", ordersRouter)
app.use('/api/categories', categoriesRouter);
app.use("/api/recom", RecommendationService);
app.use("/api/orders", ordersRouter)

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

