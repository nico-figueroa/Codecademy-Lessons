import pool from "../config/db.js";

export async function getStock(req, res) {
  const items = await pool.query(
    `SELECT * FROM items WHERE user_id = $1`,
    [req.user.id]
  );

  const stock = items.rows.map(item => ({
    item_id: item.id,
    name: item.name,
    remaining: item.container_quantity,
    projected_runout: null
  }));

  res.json({ stock });
}
