import pool from '../../db.js';
import fs from 'fs';
import path from 'path';

export async function resetTestDb() {
  const sqlPath = path.join(process.cwd(), 'src', 'tests', 'setup', 'schema.sql');
  const schema = fs.readFileSync(sqlPath, 'utf8');

  await pool.query(`
    DROP TABLE IF EXISTS payments, order_items, orders, cart_items, carts, products, oauth_accounts, users CASCADE;
  `);
  await pool.query(schema);
}
