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
    `INSERT INTO products (name, description, price, currency, stock, image_url)
     VALUES
       ('Laptop', 'High performance laptop', 1299.99, 'USD', 10, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=640&q=80'),
       ('Headphones', 'Noise cancelling', 199.99, 'USD', 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=640&q=80')`,
  );
}
