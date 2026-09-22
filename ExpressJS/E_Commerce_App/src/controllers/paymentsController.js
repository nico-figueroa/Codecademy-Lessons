import pool from "../db.js";

// Controller for managing payments in the e-commerce application
// Provides functions to create a payment and retrieve a specific payment
// Ensures that users can only access their own payments unless they have an admin role
// Maintains transactional integrity when creating payments

// Creates a new payment for an order, ensuring the user has access rights and maintaining transactional integrity
// Retrieves a specific payment by ID, ensuring the user has access rights
export async function createPayment(req, res) {
  const { orderId, provider, dummyToken } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;
  const isApproved = dummyToken === "test_approved";
  const paymentStatus = isApproved ? "captured" : "failed";
  const orderPaymentStatus = isApproved ? "paid" : "failed";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `SELECT
         id,
         user_id AS "userId",
         total_amount AS "totalAmount",
         currency,
         payment_status AS "paymentStatus"
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

    if (role !== "admin" && order.userId !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Forbidden" });
    }

    const paymentRes = await client.query(
      `INSERT INTO payments (
         order_id,
         amount,
         currency,
         provider,
         status,
         dummy_token
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         order_id AS "orderId",
         amount,
         currency,
         provider,
         status,
         dummy_token AS "dummyToken",
         created_at AS "createdAt"`,
      [
        orderId,
        order.totalAmount,
        order.currency,
        provider,
        paymentStatus,
        dummyToken,
      ],
    );

    await client.query(
      `UPDATE orders
       SET payment_status = $2,
           payment_provider = $3,
           payment_reference = $4,
           updated_at = NOW()
       WHERE id = $1`,
      [orderId, orderPaymentStatus, provider, paymentRes.rows[0].id],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      ...paymentRes.rows[0],
      outcome: isApproved ? "approved" : "declined",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Ensures that users can only access their own payments unless they have an admin role
// Retrieves a specific payment by ID, ensuring the user has access rights
export async function getPayment(req, res) {
  const { paymentId } = req.params;
  const userId = req.user.userId;
  const role = req.user.role;

  const paymentRes = await pool.query(
    `SELECT
       id,
       order_id AS "orderId",
       amount,
       currency,
       provider,
       status,
       dummy_token AS "dummyToken",
       created_at AS "createdAt"
     FROM payments
     WHERE id = $1`,
    [paymentId],
  );

  if (paymentRes.rowCount === 0) {
    return res.status(404).json({ error: "Payment not found" });
  }

  const payment = paymentRes.rows[0];

  const orderRes = await pool.query(
    `SELECT user_id AS "userId" FROM orders WHERE id = $1`,
    [payment.orderId],
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: "Order not found for payment" });
  }

  const order = orderRes.rows[0];

  if (role !== "admin" && order.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json(payment);
}
