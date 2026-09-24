const express = require("express");
const { create, read, removeTodo, updateTodo } = require("../controller");
const router = express.Router();

router.post("/todo/create", create);
router.get("/todos", read);
router.delete("/todo/:id", removeTodo);
router.put("/todo/:id", updateTodo);

module.exports = router;
