import pool from "../config/db.js";
import { fetchFromDailyMed } from "./dailymedService.js";

const CACHE_HOURS = 24;

export async function getReferenceForItem(item) {
  const normalized = normalizeName(item.name);

  const cached = await getCachedReference(normalized);
  if (cached) return cached;

  const payloads = [];

  const dailymedData = await fetchFromDailyMed(normalized);
  if (dailymedData) {
    payloads.push({
      source: "dailymed",
      data: dailymedData
    });
  }

  // TODO: add NIH supplement + FDA SRS later

  await cacheReference(normalized, item.name, payloads);

  return payloads;
}

async function getCachedReference(normalizedName) {
  const result = await pool.query(
    `SELECT payload, fetched_at
     FROM reference_cache
     WHERE normalized_name = $1
     ORDER BY fetched_at DESC
     LIMIT 1`,
    [normalizedName]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const ageHours =
    (Date.now() - new Date(row.fetched_at).getTime()) / (1000 * 60 * 60);

  if (ageHours > CACHE_HOURS) return null;

  return row.payload;
}

async function cacheReference(normalizedName, itemName, payload) {
  await pool.query(
    `INSERT INTO reference_cache (item_name, normalized_name, source, payload)
     VALUES ($1, $2, $3, $4)`,
    [itemName, normalizedName, "hybrid", JSON.stringify(payload)]
  );
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}
