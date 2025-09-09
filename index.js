import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import cors from "cors";
import mongoose from 'mongoose';
import Product from "./models/product.model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import productRouter from "./routes/products.routes.js";
import ordersRouter from './routes/orders.routes.js';
import signupLoginRouter from "./routes/signupLogin.routes.js";
import categoriesRouter from './routes/categories.route.js';
import httpStatusText from "./utils/httpStatusText.js";
import chatRecomm from './routes/chat.route.js';

app.use(express.json());
app.use("/api/users", signupLoginRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", ordersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/recom', chatRecomm);

const url = process.env.MONGO_URI;

mongoose.connect(url).then(() => {
    console.log("mongoose server started");
});

app.all(/.*/, (req, res) => {
  res.status(404).json({ message: "URL Not Found" });
});

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({status: error.httpStatusText || httpStatusText.ERROR, data: null, message: error.message, code: error.statusCode || 500});
});

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("listining on port " + port);
});

