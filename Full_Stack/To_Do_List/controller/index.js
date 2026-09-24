const formidable = require("formidable");
const { create, get, update, remove } = require("../model/todo");

exports.create = (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields) => {
    // formidable v3 returns field values as arrays, so unwrap to a plain string
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description;
    // check to see if the description field exists in the form
    // if description doesn't exist, send error
    if (!description) {
      return res.status(400).json({
        error: "Description is required",
      });
    }
    // if description exists, add to database using create() function
    try {
      const newTask = await create(description);
      return res.status(201).send({ data: newTask });
    } catch (error) {
      // if description cannot be added to database, send error
      return res.status(400).json({
        error: "Error creating task",
      });
    }
  });
};

exports.read = async (req, res) => {
  try {
    const task = await get();
    return res.json({ data: task });
  } catch (err) {
    return res.status(400).json({
      error: "Error fetching tasks",
    });
  }
};

exports.removeTodo = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await remove(id);
    return res.status(200).send({ data: id });
  } catch (error) {
    return res.status(400).json({
      error: "Error deleting task",
    });
  }
};

exports.updateTodo = async (req, res) => {
  const id = Number(req.params.id);
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    const updated = await update(id, description);
    return res.status(200).send({ data: updated });
  } catch (error) {
    return res.status(400).json({ error: "Error updating task" });
  }
};
