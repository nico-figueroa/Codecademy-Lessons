import pool from "../db.js";

// Controller functions for managing shopping carts and cart items
async function getOrCreateCartForUser(userId) {
  const existing = await pool.query(
    `SELECT id, user_id AS "userId", currency, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM carts
     WHERE user_id = $1`,
    [userId],
  );

  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const created = await pool.query(
    `INSERT INTO carts (user_id, currency)
     VALUES ($1, 'USD')
     RETURNING id, user_id AS "userId", currency, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [userId],
  );

  return created.rows[0];
}

// Helper function to build a comprehensive cart response including items and total amount
async function buildCartResponse(cartId) {
  const cartRes = await pool.query(
    `SELECT id, user_id AS "userId", currency, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM carts
     WHERE id = $1`,
    [cartId],
  );

  if (cartRes.rowCount === 0) return null;

  const itemsRes = await pool.query(
    `SELECT
       id,
       cart_id AS "cartId",
       product_id AS "productId",
       quantity,
       unit_price AS "unitPrice",
       currency
     FROM cart_items
     WHERE cart_id = $1`,
    [cartId],
  );

  const totalRes = await pool.query(
    `SELECT COALESCE(SUM(quantity * unit_price), 0) AS "totalAmount"
     FROM cart_items
     WHERE cart_id = $1`,
    [cartId],
  );

  const cart = cartRes.rows[0];
  cart.items = itemsRes.rows;
  cart.totalAmount = Number(totalRes.rows[0].totalAmount || 0);

  return cart;
}

// Retrieves the current user's cart, creating one if it doesn't exist, and returns the full cart response
export async function getMyCart(req, res) {
  const userId = req.user.userId;

  const cart = await getOrCreateCartForUser(userId);
  const fullCart = await buildCartResponse(cart.id);

  res.json(fullCart);
}

// Creates a new cart for the current user or resets the existing one by deleting all its items, then returns the full cart response
export async function createOrResetCart(req, res) {
  const userId = req.user.userId;

  const cart = await getOrCreateCartForUser(userId);

  await pool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart.id]);

  const fullCart = await buildCartResponse(cart.id);
  res.status(201).json(fullCart);
}

// Adds an item to the current user's cart, updating the quantity if the item already exists, and returns the full cart response
export async function addItem(req, res) {
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  const cart = await getOrCreateCartForUser(userId);

  const productRes = await pool.query(
    `SELECT price, currency FROM products WHERE id = $1 AND is_active = TRUE`,
    [productId],
  );
  if (productRes.rowCount === 0) {
    return res.status(404).json({ error: "Product not found or inactive" });
  }

  const { price, currency } = productRes.rows[0];

  // upsert on (cart_id, product_id)
  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, currency)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET
       quantity = cart_items.quantity + EXCLUDED.quantity,
       unit_price = EXCLUDED.unit_price,
       currency = EXCLUDED.currency,
       updated_at = NOW()`,
    [cart.id, productId, quantity, price, currency],
  );

  const fullCart = await buildCartResponse(cart.id);
  res.status(201).json(fullCart);
}

// Updates the quantity of a specific item in the current user's cart and returns the full cart response
export async function updateItem(req, res) {
  const userId = req.user.userId;
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCartForUser(userId);

  const result = await pool.query(
    `UPDATE cart_items
     SET quantity = $2,
         updated_at = NOW()
     WHERE id = $1 AND cart_id = $3
     RETURNING id`,
    [itemId, quantity, cart.id],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Cart item not found" });
  }

  const fullCart = await buildCartResponse(cart.id);
  res.json(fullCart);
}

// Removes a specific item from the current user's cart and returns the full cart response
export async function removeItem(req, res) {
  const userId = req.user.userId;
  const { itemId } = req.params;

  const cart = await getOrCreateCartForUser(userId);

  const result = await pool.query(
    `DELETE FROM cart_items
     WHERE id = $1 AND cart_id = $2`,
    [itemId, cart.id],
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Cart item not found" });
  }

  const fullCart = await buildCartResponse(cart.id);
  res.json(fullCart);
}
