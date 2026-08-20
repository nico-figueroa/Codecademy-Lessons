// Accepts either UTC-seconds timestamps (numbers) or date strings.
export default function validateDateRange(start, end) {
  const startMs = typeof start === "number" ? start * 1000 : new Date(start).getTime();
  const endMs = typeof end === "number" ? end * 1000 : new Date(end).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false;
  if (startMs >= endMs) return false;

  return true;
}
