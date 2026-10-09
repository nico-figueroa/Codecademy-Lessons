import { analyzeInteractions } from "../services/interactionEngine.js";
import pool from "../config/db.js";

export async function getInteractions(req, res) {
  const itemsResult = await pool.query(
    `SELECT * FROM items WHERE user_id = $1`,
    [req.user.id]
  );

  const interactions = await analyzeInteractions(itemsResult.rows);

  res.json({ interactions });
}
