// Lightweight SQL logger for PostgreSQL queries

export function logQuery(sql, params, duration) {
  const time = duration.toFixed(2).padStart(6, ' ');
  const isSlow = duration > 50; // ms threshold

  console.log(
    `\n📘 SQL Query (${time} ms${isSlow ? ' ⚠️ SLOW' : ''})\n` +
    `  SQL: ${sql}\n` +
    `  Params: ${JSON.stringify(params)}\n`
  );
}
