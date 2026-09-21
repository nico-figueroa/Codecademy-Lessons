import dotenv from 'dotenv';
import path from 'path';

export default async function () {
  dotenv.config({
    path: path.join(process.cwd(), 'src', 'tests', 'setup', '.env.test')
  });

  const { default: pool } = await import('../../db.js');
  await pool.end();
}