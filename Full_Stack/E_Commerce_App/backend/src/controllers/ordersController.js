import pool from "../db.js";
import { isStaff } from "../middleware/authMiddleware.js";
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
    isStaff(role)
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

  const params = isStaff(role) ? [] : [userId];

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

  if (!isStaff(role) && order.userId !== userId) {
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

// Replaces the quantities of an unpaid order, adjusting stock and the total.
// A quantity of 0 removes the line; unknown products are added.
// Runs inside the caller's transaction; returns {code, error} on failure so the
// caller can roll everything back.
async function replaceOrderItems(client, orderId, items) {
  {
    await client.query(`SELECT id FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);

    const currentRes = await client.query(
      `SELECT id, product_id, quantity FROM order_items WHERE order_id = $1`,
      [orderId],
    );
    const current = new Map(currentRes.rows.map((r) => [r.product_id, r]));
    const desired = new Map();
    for (const it of items) desired.set(it.productId, it.quantity);

    if ([...desired.values()].every((q) => q === 0) && desired.size >= current.size) {
      return { code: 400, error: "An order needs at least one item; cancel it instead" };
    }

    for (const [productId, qty] of desired) {
      const existing = current.get(productId);
      const delta = qty - (existing?.quantity ?? 0);
      if (delta === 0) continue;

      const prodRes = await client.query(
        `SELECT price, currency, stock, is_active FROM products WHERE id = $1 FOR UPDATE`,
        [productId],
      );
      if (prodRes.rowCount === 0) {
        return { code: 404, error: "Product not found" };
      }
      const product = prodRes.rows[0];
      if (delta > 0 && (!product.is_active || product.stock < delta)) {
        return { code: 409, error: "Insufficient stock for order" };
      }

      await client.query(
        `UPDATE products SET stock = stock - $2, updated_at = NOW() WHERE id = $1`,
        [productId, delta],
      );

      if (qty === 0) {
        await client.query(`DELETE FROM order_items WHERE id = $1`, [existing.id]);
      } else if (existing) {
        await client.query(
          `UPDATE order_items SET quantity = $2, updated_at = NOW() WHERE id = $1`,
          [existing.id, qty],
        );
      } else {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, currency)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, productId, qty, product.price, product.currency],
        );
      }
    }

    const totalRes = await client.query(
      `SELECT COALESCE(SUM(quantity * unit_price), 0) AS total, COUNT(*) AS n
       FROM order_items WHERE order_id = $1`,
      [orderId],
    );
    if (Number(totalRes.rows[0].n) === 0) {
      return { code: 400, error: "An order needs at least one item; cancel it instead" };
    }
    await client.query(
      `UPDATE orders SET total_amount = $2, updated_at = NOW() WHERE id = $1`,
      [orderId, totalRes.rows[0].total],
    );
    return {};
  }
}

// Updates the status of an existing order, ensuring the user has access rights
const CANCELLABLE_STATUSES = ["pending", "paid"];

export async function updateOrder(req, res) {
  const { orderId } = req.params;
  const {
    status,
    userId: newOwnerId,
    paymentStatus,
    shippingAddress,
    items,
  } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;
  const staff = isStaff(role);

  // All changes are applied in a single transaction so a failure leaves the
  // order untouched.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `SELECT id, user_id AS "userId", status, payment_status AS "paymentStatus"
       FROM orders
       WHERE id = $1
       FOR UPDATE`,
      [orderId],
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderRes.rows[0];
    const fail = async (code, error) => {
      await client.query("ROLLBACK");
      return res.status(code).json({ error });
    };

    if (newOwnerId !== undefined) {
      if (!staff) return fail(403, "Only staff can reassign orders");
      if (order.paymentStatus === "paid") {
        return fail(409, "A paid order cannot be reassigned");
      }
      const ownerRes = await client.query(
        `SELECT id FROM users WHERE id = $1 AND is_active = TRUE`,
        [newOwnerId],
      );
      if (ownerRes.rowCount === 0) {
        return fail(404, "Assignee not found or inactive");
      }
    }

    if (!staff) {
      if (order.userId !== userId) return fail(403, "Forbidden");
      if (
        paymentStatus !== undefined ||
        shippingAddress !== undefined ||
        items !== undefined
      ) {
        return fail(403, "Only staff can edit orders");
      }
      if (status !== "cancelled") {
        return fail(403, "Only admins can update this order status");
      }
    }

    if (paymentStatus !== undefined && role !== "admin") {
      return fail(403, "Only admins can change the payment status");
    }

    if (
      status === "cancelled" &&
      order.status !== "cancelled" &&
      !CANCELLABLE_STATUSES.includes(order.status)
    ) {
      return fail(409, `A ${order.status} order cannot be cancelled`);
    }

    if (items !== undefined) {
      if (order.status !== "pending" || order.paymentStatus === "paid") {
        return fail(409, "Items can only be edited on unpaid pending orders");
      }
    }

    if (newOwnerId !== undefined) {
      await client.query(
        `UPDATE orders SET user_id = $2, updated_at = NOW() WHERE id = $1`,
        [orderId, newOwnerId],
      );
    }

    if (shippingAddress !== undefined) {
      await client.query(
        `UPDATE orders
         SET shipping_name = $2, shipping_phone = $3, shipping_line1 = $4,
             shipping_line2 = $5, shipping_city = $6, shipping_state = $7,
             shipping_postal_code = $8, shipping_country = $9, updated_at = NOW()
         WHERE id = $1`,
        [
          orderId,
          shippingAddress.name,
          shippingAddress.phone || null,
          shippingAddress.line1,
          shippingAddress.line2 || null,
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.postalCode,
          shippingAddress.country,
        ],
      );
    }

    if (items !== undefined) {
      const outcome = await replaceOrderItems(client, orderId, items);
      if (outcome.error) return fail(outcome.code, outcome.error);
    }

    let effectiveStatus = status;
    if (paymentStatus !== undefined) {
      await client.query(
        `UPDATE orders SET payment_status = $2, updated_at = NOW() WHERE id = $1`,
        [orderId, paymentStatus],
      );
      // Keep the order status consistent when payment is confirmed manually
      if (
        paymentStatus === "paid" &&
        status === undefined &&
        order.status === "pending"
      ) {
        effectiveStatus = "paid";
      }
    }

    if (
      status === "cancelled" &&
      order.status !== "cancelled" &&
      shouldRestockOrder(order.status)
    ) {
      await restoreOrderStock(client, orderId);
    }

    const result = await client.query(
      `UPDATE orders
       SET status = COALESCE($2, status),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id AS "userId", status, total_amount AS "totalAmount", currency, payment_status AS "paymentStatus", payment_provider AS "paymentProvider", payment_reference AS "paymentReference", created_at AS "createdAt", updated_at AS "updatedAt", shipping_name AS "shippingName", shipping_phone AS "shippingPhone", shipping_line1 AS "shippingLine1", shipping_line2 AS "shippingLine2", shipping_city AS "shippingCity", shipping_state AS "shippingState", shipping_postal_code AS "shippingPostalCode", shipping_country AS "shippingCountry"`,
      [orderId, effectiveStatus ?? null],
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
         AND ($2 IN ('admin','vendor') OR user_id = $3)
       FOR UPDATE`,
      [orderId, role, userId],
    );

    if (orderRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }

    if (!CANCELLABLE_STATUSES.includes(orderRes.rows[0].status)) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: `A ${orderRes.rows[0].status} order cannot be cancelled` });
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

  // Manual entry: staff supply the carrier/tracking instead of buying a label
  const manual = req.body;
  if (manual?.carrier && manual?.trackingNumber) {
    const ins = await pool.query(
      `INSERT INTO shipments (order_id, provider, carrier, service, tracking_number, tracking_url)
       VALUES ($1, 'manual', $2, $3, $4, $5)
       RETURNING ${SHIPMENT_COLUMNS}`,
      [
        orderId,
        String(manual.carrier).slice(0, 100),
        manual.service ? String(manual.service).slice(0, 100) : null,
        String(manual.trackingNumber).slice(0, 255),
        manual.trackingUrl ? String(manual.trackingUrl).slice(0, 2000) : null,
      ],
    );
    await pool.query(
      `UPDATE orders SET status = 'shipped', updated_at = NOW() WHERE id = $1`,
      [orderId],
    );
    return res.status(201).json(ins.rows[0]);
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
// Staff: edit the latest shipment's carrier/tracking details or status.
export async function updateShipment(req, res) {
  const { orderId } = req.params;
  const b = req.body;
  const result = await pool.query(
    `UPDATE shipments SET
       carrier = COALESCE($2, carrier),
       service = COALESCE($3, service),
       tracking_number = COALESCE($4, tracking_number),
       tracking_url = COALESCE($5, tracking_url),
       status = COALESCE($6, status),
       updated_at = NOW()
     WHERE id = (SELECT id FROM shipments WHERE order_id = $1
                 ORDER BY created_at DESC LIMIT 1)
     RETURNING ${SHIPMENT_COLUMNS}`,
    [
      orderId,
      b.carrier ?? null,
      b.service ?? null,
      b.trackingNumber ?? null,
      b.trackingUrl ?? null,
      b.status ?? null,
    ],
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Shipment not found" });
  }
  res.json(result.rows[0]);
}

// Staff: removes the order's shipments; a shipped order goes back to paid.
export async function deleteShipment(req, res) {
  const { orderId } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const del = await client.query(
      `DELETE FROM shipments WHERE order_id = $1`,
      [orderId],
    );
    if (del.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Shipment not found" });
    }
    await client.query(
      `UPDATE orders SET status = 'paid', updated_at = NOW()
       WHERE id = $1 AND status = 'shipped'`,
      [orderId],
    );
    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}