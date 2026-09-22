import pool from "../db.js";

// Controller for managing products in the e-commerce application
// Provides functions to list products, create a new product, retrieve a specific product, update a product, and delete a product
// Ensures that only active products are listed
// Maintains data integrity when creating, updating, or deleting products

// Lists all active products, ensuring only active products are returned
export async function listProducts(req, res) {
  const result = await pool.query(
    `SELECT
       id,
       name,
       description,
       sku,
       price,
       currency,
       stock,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM products
     WHERE is_active = TRUE
     ORDER BY created_at DESC`,
  );
  res.json(result.rows);
}

// Creates a new product with the provided details
export async function createProduct(req, res) {
  const {
    name,
    description,
    sku,
    price,
    currency = "USD",
    stock = 0,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO products (name, description, sku, price, currency, stock)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING
       id,
       name,
       description,
       sku,
       price,
       currency,
       stock,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [name, description, sku, price, currency, stock],
  );

  res.status(201).json(result.rows[0]);
}

// Retrieves a specific product by ID
export async function getProduct(req, res) {
  const { productId } = req.params;

  const result = await pool.query(
    `SELECT
       id,
       name,
       description,
       sku,
       price,
       currency,
       stock,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM products
    WHERE id = $1 AND is_active = TRUE`,
    [productId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(result.rows[0]);
}

// Updates an existing product with the provided details
export async function updateProduct(req, res) {
  const { productId } = req.params;
  const { name, description, sku, price, currency, stock, isActive } = req.body;

  const result = await pool.query(
    `UPDATE products
     SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       sku = COALESCE($4, sku),
       price = COALESCE($5, price),
       currency = COALESCE($6, currency),
       stock = COALESCE($7, stock),
       is_active = COALESCE($8, is_active),
       updated_at = NOW()
     WHERE id = $1
     RETURNING
       id,
       name,
       description,
       sku,
       price,
       currency,
       stock,
       is_active AS "isActive",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [productId, name, description, sku, price, currency, stock, isActive],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(result.rows[0]);
}

// Soft deletes a product by setting its active status to false
export async function deleteProduct(req, res) {
  const { productId } = req.params;

  const result = await pool.query(
    `UPDATE products
     SET is_active = FALSE,
         updated_at = NOW()
     WHERE id = $1`,
    [productId],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(204).send();
}
