const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("You have reached RESTful Restaurants API");
});

module.exports = router;
