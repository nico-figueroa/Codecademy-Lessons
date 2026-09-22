import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const directory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(directory, "..", ".env") });

const { default: pool } = await import("../db.js");
const { hashPassword } = await import("../utils/password.js");

// Seed the development database with initial data
async function seedDev() {
  console.log("🌱 Seeding development database...");

  await pool.query("DELETE FROM payments");
  await pool.query("DELETE FROM order_items");
  await pool.query("DELETE FROM orders");
  await pool.query("DELETE FROM cart_items");
  await pool.query("DELETE FROM carts");
  await pool.query("DELETE FROM products");
  await pool.query("DELETE FROM oauth_accounts");
  await pool.query("DELETE FROM users");

  const passwordHash = await hashPassword("Password123!");

  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ('admin@example.com', $1, 'admin')`,
    [passwordHash],
  );

  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ('customer@example.com', $1, 'customer')`,
    [passwordHash],
  );

  await pool.query(
    `INSERT INTO products (name, description, price, currency, stock)
     VALUES
       ('Laptop', 'High performance laptop', 1299.99, 'USD', 10),
       ('Headphones', 'Noise cancelling', 199.99, 'USD', 50),
       ('Keyboard', 'Mechanical keyboard', 89.99, 'USD', 100)`,
  );

  console.log("🌱 Development database seeded.");
  await pool.end();
}

seedDev().catch(async (error) => {
  console.error("Failed to seed development database:", error);
  await pool.end();
  process.exitCode = 1;
});
