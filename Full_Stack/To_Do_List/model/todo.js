const pool = require("./database");

if (!pool) {
  console.error("Database connection not established");
  throw new Error("Database connection not established");
}

const get = async () => {
  const result = await pool.query("SELECT * FROM todo");
  return result.rows;
};

const create = async (description) => {
  const result = await pool.query(
    "INSERT INTO todo (description) VALUES ($1) RETURNING *",
    [description],
  );
  return result.rows[0];
};

const update = async (id, description) => {
  const result = await pool.query(
    "UPDATE todo SET description = $1 WHERE todo_id = $2 RETURNING *",
    [description, id]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
  return result.rows[0];
};

module.exports = {
  get,
  create,
  update,
  remove,
};
