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

  await pool.query("DELETE FROM shipments");
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
       ('Laptop', 'High performance laptop', 1299.99, 'USD', 10, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=640&q=80'),
       ('Iphone', 'Latest-generation smartphone', 999.99, 'USD', 30, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=640&q=80'),
       ('Headphones', 'Noise cancelling', 199.99, 'USD', 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=640&q=80'),
       ('Keyboard', 'Mechanical keyboard', 89.99, 'USD', 100, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=640&q=80'),
       ('Wireless Mouse', 'Ergonomic wireless mouse', 39.99, 'USD', 150, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=640&q=80'),
       ('4K Monitor', '27-inch 4K UHD monitor', 349.99, 'USD', 25, 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?auto=format&fit=crop&w=640&q=80'),
       ('Webcam', '1080p HD webcam', 59.99, 'USD', 75, 'https://images.unsplash.com/photo-1760348213920-d2a90ed705fd?auto=format&fit=crop&w=640&q=80')`,
  );

  console.log("🌱 Development database seeded.");
  await pool.end();
}

seedDev().catch(async (error) => {
  console.error("Failed to seed development database:", error);
  await pool.end();
  process.exitCode = 1;
});
