import pool from "../db.js";

async function restoreOrderStock(client, orderId) {
  const itemsRes = await client.query(
    `SELECT product_id, quantity
     FROM order_items
     WHERE order_id = $1`,
    [orderId],
  );

  for (const item of itemsRes.rows) {
    await client.query(
      `UPDATE products
       SET stock = stock + $2,
           updated_at = NOW()
       WHERE id = $1`,
      [item.product_id, item.quantity],
    );
  }
}

function shouldRestockOrder(status) {
  return status === "pending" || status === "paid";
}

// Controller for managing orders in the e-commerce application
// Provides functions to list orders, retrieve a specific order, and place a new order
// Ensures that users can only access their own orders unless they have an admin role
// Maintains transactional integrity when placing orders

// Lists all orders for the current user or all orders if the user is an admin
// Retrieves a specific order by ID, ensuring the user has access rights
// Places a new order based on the current user's cart, ensuring transactional integrity
export async function listOrders(req, res) {
  const userId = req.user.userId;
  const role = req.user.role;

  const query =
    role === "admin"
      ? `SELECT
           id,
           user_id AS "userId",
           status,
           total_amount AS "totalAmount",
           currency,
           payment_status AS "paymentStatus",
           payment_provider AS "paymentProvider",
           payment_reference AS "paymentReference",
           created_at AS "createdAt",
           updated_at AS "updatedAt"
         FROM orders
         ORDER BY created_at DESC`
      : `SELECT
           id,
           user_id AS "userId",
           status,
           total_amount AS "totalAmount",
           currency,
           payment_status AS "paymentStatus",
           payment_provider AS "paymentProvider",
           payment_reference AS "paymentReference",
           created_at AS "createdAt",
           updated_at AS "updatedAt"
         FROM orders
         WHERE user_id = $1
         ORDER BY created_at DESC`;

  const params = role === "admin" ? [] : [userId];

  const result = await pool.query(query, params);
  res.json(result.rows);
}

// Retrieves a specific order by ID, ensuring the user has access rights
// Places a new order based on the current user's cart, ensuring transactional integrity

export async function getOrder(req, res) {
  const { orderId } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;

  const orderRes = await pool.query(
    `SELECT
       id,
       user_id AS "userId",
       status,
       total_amount AS "totalAmount",
       currency,
       payment_status AS "paymentStatus",
       payment_provider AS "paymentProvider",
       payment_reference AS "paymentReference",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
     FROM orders
     WHERE id = $1`,
    [orderId],
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = orderRes.rows[0];

  if (role !== "admin" && order.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const itemsRes = await pool.query(
    `SELECT
       id,
       order_id AS "orderId",
       product_id AS "productId",
       quantity,
       unit_price AS "unitPrice",
       currency
     FROM order_items
     WHERE order_id = $1`,
    [orderId],
  );

  order.items = itemsRes.rows;
  res.json(order);
}

// Ensures that users can only access their own orders unless they have an admin role
export async function placeOrder(req, res) {
  const userId = req.user.userId;

  const client = await pool.connect();
  let committed = false;
  try {
    await client.query("BEGIN");

    const cartRes = await client.query(
      `SELECT id, currency
       FROM carts
       WHERE user_id = $1`,
      [userId],
    );
    if (cartRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No cart for user" });
    }

    const cart = cartRes.rows[0];

    const itemsRes = await client.query(
      `SELECT
         ci.id,
         ci.product_id,
         ci.quantity,
         ci.unit_price,
         ci.currency,
         p.stock,
         p.is_active
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       FOR UPDATE OF p`,
      [cart.id],
    );
    if (itemsRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cart is empty" });
    }

    for (const item of itemsRes.rows) {
      if (!item.is_active || item.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "Insufficient stock for order" });
      }
    }

    const totalAmount = itemsRes.rows.reduce(
      (sum, item) => sum + Number(item.unit_price) * item.quantity,
      0,
    );

    const orderRes = await client.query(
      `INSERT INTO orders (
         user_id,
         status,
         total_amount,
         currency,
         payment_status
       )
       VALUES ($1, 'pending', $2, $3, 'unpaid')
       RETURNING id,
                 user_id AS "userId",
                 status,
                 total_amount AS "totalAmount",
                 currency,
                 payment_status AS "paymentStatus",
                 payment_provider AS "paymentProvider",
                 payment_reference AS "paymentReference",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      [userId, totalAmount, cart.currency],
    );

    const order = orderRes.rows[0];

    for (const item of itemsRes.rows) {
      await client.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           quantity,
           unit_price,
           currency
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.currency,
        ],
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $2,
             updated_at = NOW()
         WHERE id = $1`,
        [item.product_id, item.quantity],
      );
    }

    await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart.id]);

    await client.query("COMMIT");
    committed = true;

    const orderItemsRes = await pool.query(
      `SELECT
         id,
         order_id AS "orderId",
         product_id AS "productId",
         quantity,
         unit_price AS "unitPrice",
         currency
       FROM order_items
       WHERE order_id = $1`,
      [order.id],
    );

    order.items = orderItemsRes.rows;
    res.status(201).json(order);
  } catch (err) {
    if (!committed) {
      await client.query("ROLLBACK");
    }
    console.error("placeOrder error", err);
    res.status(500).json({ error: "Failed to place order" });
  } finally {
    client.release();
  }
}

// Updates the status of an existing order, ensuring the user has access rights
export async function updateOrder(req, res) {
  const { orderId } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  const orderRes = await pool.query(
    `SELECT id, user_id AS "userId", status
     FROM orders
     WHERE id = $1`,
    [orderId],
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = orderRes.rows[0];

  if (role !== "admin") {
    if (order.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (status !== "cancelled") {
      return res
        .status(403)
        .json({ error: "Only admins can update this order status" });
    }
  }

  if (status === "cancelled" && order.status !== "cancelled") {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const lockedOrderRes = await client.query(
        `SELECT id, user_id AS "userId", status
         FROM orders
         WHERE id = $1
         FOR UPDATE`,
        [orderId],
      );
      const lockedOrder = lockedOrderRes.rows[0];

      if (role !== "admin" && lockedOrder.userId !== userId) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "Forbidden" });
      }

      if (shouldRestockOrder(lockedOrder.status)) {
        await restoreOrderStock(client, orderId);
      }

      const result = await client.query(
        `UPDATE orders
         SET status = 'cancelled',
             updated_at = NOW()
         WHERE id = $1
         RETURNING
           id,
           user_id AS "userId",
           status,
           total_amount AS "totalAmount",
           currency,
           payment_status AS "paymentStatus",
           payment_provider AS "paymentProvider",
           payment_reference AS "paymentReference",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [orderId],
      );

      await client.query("COMMIT");
      return res.json(result.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  const result = await pool.query(
    `UPDATE orders
     SET status = COALESCE($2, status),
         updated_at = NOW()
     WHERE id = $1
     RETURNING
       id,
       user_id AS "userId",
       status,
       total_amount AS "totalAmount",
       currency,
       payment_status AS "paymentStatus",
       payment_provider AS "paymentProvider",
       payment_reference AS "paymentReference",
       created_at AS "createdAt",
       updated_at AS "updatedAt"`,
    [orderId, status],
  );

  res.json(result.rows[0]);
}

// Cancels an existing order, ensuring the user has access rights
export async function cancelOrder(req, res) {
  const { orderId } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `SELECT id, user_id AS "userId", status
       FROM orders
       WHERE id = $1
         AND ($2 = 'admin' OR user_id = $3)
       FOR UPDATE`,
      [orderId, role, userId],
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }

    if (shouldRestockOrder(orderRes.rows[0].status)) {
      await restoreOrderStock(client, orderId);
    }

    await client.query(
      `UPDATE orders
       SET status = 'cancelled',
           updated_at = NOW()
       WHERE id = $1`,
      [orderId],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  res.status(204).send();
}
