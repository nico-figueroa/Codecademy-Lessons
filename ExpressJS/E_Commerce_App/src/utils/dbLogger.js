// Lightweight SQL logger for PostgreSQL queries

function redactParam(value) {
  return value === null || value === undefined ? value : "[REDACTED]";
}

function formatParams(params = []) {
  return JSON.stringify(params.map(redactParam));
}

export function logQuery(sql, params, duration) {
  const time = duration.toFixed(2).padStart(6, " ");
  const isSlow = duration > 50; // ms threshold

  console.log(
    `\n📘 SQL Query (${time} ms${isSlow ? " ⚠️ SLOW" : ""})\n` +
      `  SQL: ${sql}\n` +
      `  Params: ${formatParams(params)}\n`,
  );
}

export function logQueryError(sql, params, duration, err) {
  console.error(
    `\n❌ SQL Error (${duration.toFixed(2)} ms)\n` +
      `  SQL: ${sql}\n` +
      `  Params: ${formatParams(params)}\n` +
      `  Error: ${err.message}\n`,
  );
}
