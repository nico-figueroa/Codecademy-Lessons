import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query("SELECT NOW()", (err, res) => {
  console.log(err || res.rows);
});

export default pool;
