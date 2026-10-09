import pool from "../config/db.js";
import { buildSchedule } from "../services/scheduleEngine.js";

export async function generateSchedule(req, res) {
  const { from, to } = req.query;

  const items = await pool.query(
    `SELECT * FROM items WHERE user_id = $1`,
    [req.user.id]
  );

  const overrides = await pool.query(
    `SELECT * FROM schedule_overrides WHERE user_id = $1`,
    [req.user.id]
  );

  const schedule = buildSchedule(items.rows, overrides.rows, from, to);

  res.json({ schedule });
}
