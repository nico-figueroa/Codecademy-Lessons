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
    `INSERT INTO products (name, description, price, currency, stock, image_url)
     VALUES
       ('Laptop', 'High performance laptop', 1299.99, 'USD', 10, 'https://picsum.photos/seed/laptop/640/480'),
       ('Headphones', 'Noise cancelling', 199.99, 'USD', 50, 'https://picsum.photos/seed/headphones/640/480'),
       ('Keyboard', 'Mechanical keyboard', 89.99, 'USD', 100, 'https://picsum.photos/seed/keyboard/640/480'),
       ('Wireless Mouse', 'Ergonomic wireless mouse', 39.99, 'USD', 150, 'https://picsum.photos/seed/mouse/640/480'),
       ('4K Monitor', '27-inch 4K UHD monitor', 349.99, 'USD', 25, 'https://picsum.photos/seed/monitor/640/480'),
       ('Webcam', '1080p HD webcam', 59.99, 'USD', 75, 'https://picsum.photos/seed/webcam/640/480')`,
  );

  console.log("🌱 Development database seeded.");
  await pool.end();
}

seedDev().catch(async (error) => {
  console.error("Failed to seed development database:", error);
  await pool.end();
  process.exitCode = 1;
});
