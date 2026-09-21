import pool from '../db.js';

export async function createPayment(req, res) {
  const { orderId, provider, dummyToken } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

  const orderRes = await pool.query(
    `SELECT
       id,
       user_id AS "userId",
       total_amount AS "totalAmount",
       currency,
       payment_status AS "paymentStatus"
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

  const paymentRes = await pool.query(
    `INSERT INTO payments (
       order_id,
       amount,
       currency,
       provider,
       status,
       dummy_token
     )
     VALUES ($1, $2, $3, $4, 'pending', $5)
     RETURNING
       id,
       order_id AS "orderId",
       amount,
       currency,
       provider,
       status,
       dummy_token AS "dummyToken",
       created_at AS "createdAt"`,
    [orderId, order.totalAmount, order.currency, provider, dummyToken]
  );

  // Optionally update order payment_status
  await pool.query(
    `UPDATE orders
     SET payment_status = 'paid',
         payment_provider = $2,
         payment_reference = $3,
         updated_at = NOW()
     WHERE id = $1`,
    [orderId, provider, paymentRes.rows[0].id]
  );

  res.status(201).json(paymentRes.rows[0]);
}

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
    [paymentId]
  );

  if (paymentRes.rowCount === 0) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  const payment = paymentRes.rows[0];

  const orderRes = await pool.query(
    `SELECT user_id AS "userId" FROM orders WHERE id = $1`,
    [payment.orderId]
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({ error: 'Order not found for payment' });
  }

  const order = orderRes.rows[0];

  if (role !== 'admin' && order.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(payment);
}
