import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

const SPL_SEARCH_URL =
  "https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json";

export async function fetchSplList(normalizedName) {
  const url = `${SPL_SEARCH_URL}?drug_name=${encodeURIComponent(normalizedName)}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.data || data.data.length === 0) return null;

  return data.data; // list of SPL metadata
}

export async function fetchSplXml(splId) {
  const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${splId}.xml`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  return parser.parse(xml);
}