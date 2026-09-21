import pkg from 'pg';
import { logQuery } from './utils/dbLogger.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Wrap pool.query to add logging
const originalQuery = pool.query.bind(pool);

pool.query = async (sql, params = []) => {
  const start = performance.now();

  try {
    const result = await originalQuery(sql, params);
    const duration = performance.now() - start;

    logQuery(sql, params, duration);

    return result;
  } catch (err) {
    const duration = performance.now() - start;

    console.error(
      `\n❌ SQL Error (${duration.toFixed(2)} ms)\n` +
      `  SQL: ${sql}\n` +
      `  Params: ${JSON.stringify(params)}\n` +
      `  Error: ${err.message}\n`
    );

    throw err;
  }
};

export default pool;
