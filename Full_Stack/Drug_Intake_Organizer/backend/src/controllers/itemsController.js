import pool from "../config/db.js";

export async function getItems(req, res) {
  const result = await pool.query(
    `SELECT * FROM items WHERE user_id = $1 ORDER BY id`,
    [req.user.id]
  );
  res.json(result.rows);
}

export async function getItem(req, res) {
  const result = await pool.query(
    `SELECT * FROM items WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  res.json(result.rows[0] || {});
}

export async function createItem(req, res) {
  const {
    name,
    category,
    dosage_per_intake,
    frequency,
    times_of_day,
    container_quantity
  } = req.body;

  const result = await pool.query(
    `INSERT INTO items
     (user_id, name, category, dosage_per_intake, frequency, times_of_day, container_quantity)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      req.user.id,
      name,
      category,
      dosage_per_intake,
      frequency,
      times_of_day,
      container_quantity
    ]
  );

  res.json(result.rows[0]);
}

export async function updateItem(req, res) {
  const {
    name,
    category,
    dosage_per_intake,
    frequency,
    times_of_day,
    container_quantity
  } = req.body;

  const result = await pool.query(
    `UPDATE items SET
      name = $1,
      category = $2,
      dosage_per_intake = $3,
      frequency = $4,
      times_of_day = $5,
      container_quantity = $6,
      updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      name,
      category,
      dosage_per_intake,
      frequency,
      times_of_day,
      container_quantity,
      req.params.id,
      req.user.id
    ]
  );

  res.json(result.rows[0]);
}

export async function deleteItem(req, res) {
  await pool.query(
    `DELETE FROM items WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );

  res.json({ message: "deleted" });
}
