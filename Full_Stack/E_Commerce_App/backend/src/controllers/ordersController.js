import pool from "../db.js";
import shippoClient from "../utils/shippoClient.js";

export const SHIPMENT_COLUMNS = `
  id,
  order_id AS "orderId",
  provider,
  carrier,
  service,
  tracking_number AS "trackingNumber",
  tracking_url AS "trackingUrl",
  label_url AS "labelUrl",
  status,
  created_at AS "createdAt"`;

// Groups the flat shipping_* columns into a nested `shippingAddress` object.
export function shapeOrder(row) {
  if (!row) return row;
  const {
    shippingName,
    shippingPhone,
    shippingLine1,
    shippingLine2,
    shippingCity,
    shippingState,
    shippingPostalCode,
    shippingCountry,
    ...rest
  } = row;
  return {
    ...rest,
    shippingAddress: shippingLine1
      ? {
          name: shippingName,
          phone: shippingPhone,
          line1: shippingLine1,
          line2: shippingLine2,
          city: shippingCity,
          state: shippingState,
          postalCode: shippingPostalCode,
          country: shippingCountry,
        }
      : null,
  };
}

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
           updated_at AS "updatedAt",           shipping_name AS "shippingName",           shipping_phone AS "shippingPhone",           shipping_line1 AS "shippingLine1",           shipping_line2 AS "shippingLine2",           shipping_city AS "shippingCity",           shipping_state AS "shippingState",           shipping_postal_code AS "shippingPostalCode",           shipping_country AS "shippingCountry"
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
           updated_at AS "updatedAt",           shipping_name AS "shippingName",           shipping_phone AS "shippingPhone",           shipping_line1 AS "shippingLine1",           shipping_line2 AS "shippingLine2",           shipping_city AS "shippingCity",           shipping_state AS "shippingState",           shipping_postal_code AS "shippingPostalCode",           shipping_country AS "shippingCountry"
         FROM orders
         WHERE user_id = $1
         ORDER BY created_at DESC`;

  const params = role === "admin" ? [] : [userId];

  const result = await pool.query(query, params);
  res.json(result.rows.map(shapeOrder));
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
       updated_at AS "updatedAt",       shipping_name AS "shippingName",       shipping_phone AS "shippingPhone",       shipping_line1 AS "shippingLine1",       shipping_line2 AS "shippingLine2",       shipping_city AS "shippingCity",       shipping_state AS "shippingState",       shipping_postal_code AS "shippingPostalCode",       shipping_country AS "shippingCountry"
     FROM orders
     WHERE id = $1`,
    [orderId],
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = shapeOrder(orderRes.rows[0]);

  if (role !== "admin" && order.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const shipmentRes = await pool.query(
    `SELECT ${SHIPMENT_COLUMNS} FROM shipments WHERE order_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [orderId],
  );
  order.shipment = shipmentRes.rows[0] ?? null;

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

  // Delivery address: explicit one from checkout, else the profile default.
  let address = req.body?.shippingAddress;
  if (!address) {
    const profileRes = await pool.query(
      `SELECT name, phone, address_line1 AS line1, address_line2 AS line2,
              city, state, postal_code AS "postalCode", country
       FROM users WHERE id = $1`,
      [userId],
    );
    const p = profileRes.rows[0];
    if (p?.line1 && p.city && p.state && p.postalCode && p.country) {
      address = { ...p, name: p.name || "Customer" };
    }
  }
  if (!address) {
    return res.status(400).json({ error: "A delivery address is required" });
  }

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
         payment_status,
         shipping_name,
         shipping_phone,
         shipping_line1,
         shipping_line2,
         shipping_city,
         shipping_state,
         shipping_postal_code,
         shipping_country
       )
       VALUES ($1, 'pending', $2, $3, 'unpaid',
               $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id,
                 user_id AS "userId",
                 status,
                 total_amount AS "totalAmount",
                 currency,
                 payment_status AS "paymentStatus",
                 payment_provider AS "paymentProvider",
                 payment_reference AS "paymentReference",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt",                 shipping_name AS "shippingName",                 shipping_phone AS "shippingPhone",                 shipping_line1 AS "shippingLine1",                 shipping_line2 AS "shippingLine2",                 shipping_city AS "shippingCity",                 shipping_state AS "shippingState",                 shipping_postal_code AS "shippingPostalCode",                 shipping_country AS "shippingCountry"`,
      [
        userId,
        totalAmount,
        cart.currency,
        address.name,
        address.phone || null,
        address.line1,
        address.line2 || null,
        address.city,
        address.state,
        address.postalCode,
        address.country,
      ],
    );

    const order = shapeOrder(orderRes.rows[0]);

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

    // Intentionally do NOT clear the cart here. The order is "pending"
    // until Stripe confirms payment, and a declined/fraudulent card should
    // leave the customer's selections staged in their cart to retry or keep
    // shopping. The cart is only cleared once the Stripe webhook confirms a
    // successful payment (see paymentsController.handleStripeWebhook), or
    // when the user explicitly clears/removes items themselves.

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
  const { status, userId: newOwnerId } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  const orderRes = await pool.query(
    `SELECT id, user_id AS "userId", status, payment_status AS "paymentStatus"
     FROM orders
     WHERE id = $1`,
    [orderId],
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = orderRes.rows[0];

  if (newOwnerId !== undefined) {
    if (role !== "admin") {
      return res.status(403).json({ error: "Only admins can reassign orders" });
    }
    if (order.paymentStatus === "paid") {
      return res
        .status(409)
        .json({ error: "A paid order cannot be reassigned" });
    }
    const ownerRes = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND is_active = TRUE`,
      [newOwnerId],
    );
    if (ownerRes.rowCount === 0) {
      return res.status(404).json({ error: "Assignee not found or inactive" });
    }
    await pool.query(
      `UPDATE orders SET user_id = $2, updated_at = NOW() WHERE id = $1`,
      [orderId, newOwnerId],
    );
    order.userId = newOwnerId;
  }

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
           updated_at AS "updatedAt",           shipping_name AS "shippingName",           shipping_phone AS "shippingPhone",           shipping_line1 AS "shippingLine1",           shipping_line2 AS "shippingLine2",           shipping_city AS "shippingCity",           shipping_state AS "shippingState",           shipping_postal_code AS "shippingPostalCode",           shipping_country AS "shippingCountry"`,
        [orderId],
      );

      await client.query("COMMIT");
      return res.json(shapeOrder(result.rows[0]));
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
       updated_at AS "updatedAt",       shipping_name AS "shippingName",       shipping_phone AS "shippingPhone",       shipping_line1 AS "shippingLine1",       shipping_line2 AS "shippingLine2",       shipping_city AS "shippingCity",       shipping_state AS "shippingState",       shipping_postal_code AS "shippingPostalCode",       shipping_country AS "shippingCountry"`,
    [orderId, status],
  );

  res.json(shapeOrder(result.rows[0]));
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

// Admin: buys a shipping label (Shippo test mode / simulated), stores the
// shipment and moves the order to "shipped".
export async function createShipment(req, res) {
  const { orderId } = req.params;

  const orderRes = await pool.query(
    `SELECT id, status,
            shipping_name AS "shippingName", shipping_phone AS "shippingPhone",
            shipping_line1 AS "shippingLine1", shipping_line2 AS "shippingLine2",
            shipping_city AS "shippingCity", shipping_state AS "shippingState",
            shipping_postal_code AS "shippingPostalCode",
            shipping_country AS "shippingCountry"
     FROM orders WHERE id = $1`,
    [orderId],
  );
  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }
  const order = shapeOrder(orderRes.rows[0]);

  if (order.status === "cancelled" || order.status === "pending") {
    return res
      .status(409)
      .json({ error: "Only paid orders can be shipped" });
  }
  if (!order.shippingAddress) {
    return res.status(409).json({ error: "Order has no delivery address" });
  }

  const existing = await pool.query(
    `SELECT id FROM shipments WHERE order_id = $1 AND status <> 'failed'`,
    [orderId],
  );
  if (existing.rowCount > 0) {
    return res.status(409).json({ error: "Order already has a shipment" });
  }

  let label;
  try {
    label = await shippoClient.createLabel(order.shippingAddress);
  } catch (err) {
    console.error("Shipment creation failed:", err.message);
    return res.status(502).json({ error: "Shipping provider error", details: err.message });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const shipRes = await client.query(
      `INSERT INTO shipments
         (order_id, provider, carrier, service, tracking_number, tracking_url,
          label_url, provider_shipment_id, provider_transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${SHIPMENT_COLUMNS}`,
      [
        orderId,
        label.provider,
        label.carrier,
        label.service,
        label.trackingNumber,
        label.trackingUrl,
        label.labelUrl,
        label.providerShipmentId,
        label.providerTransactionId,
      ],
    );
    await client.query(
      `UPDATE orders SET status = 'shipped', updated_at = NOW() WHERE id = $1`,
      [orderId],
    );
    await client.query("COMMIT");
    res.status(201).json(shipRes.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}