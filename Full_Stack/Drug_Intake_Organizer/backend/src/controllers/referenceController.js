import pool from "../config/db.js";
import { getReferenceForItem } from "../services/referenceService.js";

export async function getReference(req, res) {
  const { itemId } = req.params;

  const itemResult = await pool.query(
    `SELECT * FROM items WHERE id = $1 AND user_id = $2`,
    [itemId, req.user.id]
  );

  if (itemResult.rows.length === 0) {
    return res.status(404).json({ error: "Item not found" });
  }

  const item = itemResult.rows[0];
  const reference = await getReferenceForItem(item);

  res.json({ reference });
}
