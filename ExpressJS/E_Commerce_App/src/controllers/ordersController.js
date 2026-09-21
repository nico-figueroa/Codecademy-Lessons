import pool from '../db.js';

export async function listOrders(req, res) {
  const userId = req.user.userId;
  const role = req.user.role;

  const query =
    role === 'admin'
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

  const params = role === 'admin' ? [] : [userId];

  const result = await pool.query(query, params);
  res.json(result.rows);
}

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
    [orderId]
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = orderRes.rows[0];

  if (role !== 'admin' && order.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
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
    [orderId]
  );

  order.items = itemsRes.rows;
  res.json(order);
}

export async function placeOrder(req, res) {
  const userId = req.user.userId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cartRes = await client.query(
      `SELECT id, currency
       FROM carts
       WHERE user_id = $1`,
      [userId]
    );
    if (cartRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No cart for user' });
    }

    const cart = cartRes.rows[0];

    const itemsRes = await client.query(
      `SELECT
         id,
         product_id,
         quantity,
         unit_price,
         currency
       FROM cart_items
       WHERE cart_id = $1`,
      [cart.id]
    );
    if (itemsRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalRes = await client.query(
      `SELECT COALESCE(SUM(quantity * unit_price), 0) AS total
       FROM cart_items
       WHERE cart_id = $1`,
      [cart.id]
    );
    const totalAmount = Number(totalRes.rows[0].total || 0);

    const orderRes = await client.query(
      `INSERT INTO orders (
         user_id,
         status,
         total_amount,
         currency,
         payment_status
       )
       VALUES ($1, 'pending', $2, $3, 'unpaid')
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
      [userId, totalAmount, cart.currency]
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
        [order.id, item.product_id, item.quantity, item.unit_price, item.currency]
      );
    }

    await client.query(
      `DELETE FROM cart_items WHERE cart_id = $1`,
      [cart.id]
    );

    await client.query('COMMIT');

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
      [order.id]
    );

    order.items = orderItemsRes.rows;
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('placeOrder error', err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
}

export async function updateOrder(req, res) {
  const { orderId } = req.params;
  const { status } = req.body;

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
    [orderId, status]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(result.rows[0]);
}

export async function cancelOrder(req, res) {
  const { orderId } = req.params;

  const result = await pool.query(
    `UPDATE orders
     SET status = 'cancelled',
         updated_at = NOW()
     WHERE id = $1`,
    [orderId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.status(204).send();
}
