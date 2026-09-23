const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");

const restaurantsModule = require("./routes/restaurants");
const restaurantsRouter = restaurantsModule.router;

const starredRestaurantsModule = require("./routes/starredRestaurants")
const starredRestaurantsRouter = starredRestaurantsModule.router;

const categoriesModule = require("./routes/categories");
const categoriesRouter = categoriesModule.router;

const cors = require("cors");

const app = express();
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/restaurants/starred", starredRestaurantsRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/categories", categoriesRouter);

module.exports = app;
