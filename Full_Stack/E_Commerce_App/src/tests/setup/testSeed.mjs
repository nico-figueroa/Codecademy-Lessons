import pool from "../../db.js";
import { hashPassword } from "../../utils/password.js";

export async function seedTestData() {
  const passwordHash = await hashPassword("Password123!");

  // Seed admin user
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ('admin@example.com', $1, 'admin')`,
    [passwordHash],
  );

  // Seed customer user
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ('customer@example.com', $1, 'customer')`,
    [passwordHash],
  );

  // Seed products
  await pool.query(
    `INSERT INTO products (name, description, price, currency, stock)
     VALUES
       ('Laptop', 'High performance laptop', 1299.99, 'USD', 10),
       ('Headphones', 'Noise cancelling', 199.99, 'USD', 50)`,
  );
}
