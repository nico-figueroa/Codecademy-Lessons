import pool from "../config/db.js";
import { fetchSplList, fetchSplXml } from "./dailymedSplService.js";
import { extractInteractionsFromSplXml } from "./dailymedExtractor.js";
import { fetchNihSupplementData, extractNihWarnings } from "./nihSupplementService.js";
import { fetchFdaSrsData, extractSrsWarnings } from "./fdaSrsService.js";

const CACHE_HOURS = 24;

export async function getExternalInteractionsForItem(item) {
  const normalized = normalizeName(item.name);

  const cached = await getCachedInteractions(normalized);
  if (cached) return cached;

  const externalWarnings = [];

  // 1. Fetch SPL list
  const splList = await fetchSplList(normalized);
  if (splList && splList.length > 0) {
    const splId = splList[0].spl_id; // best match

    // 2. Fetch SPL XML
    const xml = await fetchSplXml(splId);

    // 3. Extract warnings
    const splWarnings = extractInteractionsFromSplXml(xml);
    externalWarnings.push(...splWarnings);
  }

  // 4. Fetch NIH Supplement Data
  const nihData = await fetchNihSupplementData(normalized);
  if (nihData) {
    const nihWarnings = extractNihWarnings(nihData);
    externalWarnings.push(...nihWarnings);
  }
  
  // 5. Fetch FDA SRS Data
  const srsData = await fetchFdaSrsData(normalized);
  if (srsData) {
    const srsWarnings = extractSrsWarnings(srsData);
    externalWarnings.push(...srsWarnings);
  }

  await cacheInteractions(normalized, item.name, externalWarnings);

  return externalWarnings;
}

/* -----------------------------
   Cache helpers
------------------------------*/

async function getCachedInteractions(normalizedName) {
  const result = await pool.query(
    `SELECT warnings, fetched_at
     FROM interaction_cache
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

  return row.warnings;
}

async function cacheInteractions(normalizedName, itemName, warnings) {
  await pool.query(
    `INSERT INTO interaction_cache (item_name, normalized_name, source, warnings)
     VALUES ($1, $2, $3, $4)`,
    [itemName, normalizedName, "external_hybrid", JSON.stringify(warnings)]
  );
}

/* -----------------------------
   Normalization
------------------------------*/

function normalizeName(name) {
  return name.trim().toLowerCase();
}
