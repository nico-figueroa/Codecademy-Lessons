import pool from "../db.js";
import { isStaff } from "../middleware/authMiddleware.js";
import stripeClient from "../utils/stripeClient.js";

// Controller for managing Stripe-backed payments in the e-commerce
// application.
//
// Flow:
//  1. POST /payments/intent creates (or reuses) a Stripe PaymentIntent for an
//     order and returns its client_secret so the frontend can confirm the
//     payment with Stripe's Payment Element.
//  2. The frontend confirms the PaymentIntent directly with Stripe.
//  3. Stripe calls POST /payments/webhook, which is the single source of
//     truth for marking a payment/order as paid or failed - the frontend
//     result of `stripe.confirmPayment` is only used for the immediate UI
//     state, never to grant order fulfilment.

function toStripeAmount(amount) {
  // Stripe expects the smallest currency unit (e.g. cents for USD).
  // All currencies currently supported by this app (USD) are 2-decimal.
  return Math.round(Number(amount) * 100);
}

// Creates a Stripe PaymentIntent for an order (or reuses an existing
// unresolved one so refreshing the checkout page doesn't create duplicates).
export async function createPaymentIntent(req, res) {
  const { orderId } = req.body;
  const userId = req.user.userId;
  const role = req.user.role;

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

    if (!isStaff(role) && order.userId !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Forbidden" });
    }

    if (order.paymentStatus === "paid") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Order is already paid" });
    }

    const existingRes = await client.query(
      `SELECT id, stripe_payment_intent_id AS "stripePaymentIntentId"
       FROM payments
       WHERE order_id = $1 AND status IN ('pending', 'authorized')
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId],
    );

    let paymentId;
    let clientSecret;

    let reusable = null;
    if (existingRes.rowCount > 0) {
      const existingPayment = existingRes.rows[0];
      const intent = await stripeClient.paymentIntents.retrieve(
        existingPayment.stripePaymentIntentId,
      );
      if (intent.status === "succeeded") {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({ error: "Payment already completed; refresh the order" });
      }
      if (intent.status === "canceled") {
        // Stale intent can't render a payment form; retire it and start fresh.
        await client.query(
          `UPDATE payments SET status = 'failed', updated_at = NOW() WHERE id = $1`,
          [existingPayment.id],
        );
      } else {
        reusable = { id: existingPayment.id, intent };
      }
    }

    if (reusable) {
      // Reuse the existing in-flight PaymentIntent (e.g. the user refreshed
      // the checkout page) instead of creating a duplicate.
      paymentId = reusable.id;
      clientSecret = reusable.intent.client_secret;
    } else {
      const intent = await stripeClient.paymentIntents.create({
        amount: toStripeAmount(order.totalAmount),
        currency: order.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: { orderId: order.id },
      });

      const paymentRes = await client.query(
        `INSERT INTO payments (
           order_id,
           amount,
           currency,
           provider,
           status,
           stripe_payment_intent_id
         )
         VALUES ($1, $2, $3, 'stripe', 'pending', $4)
         RETURNING id`,
        [orderId, order.totalAmount, order.currency, intent.id],
      );

      paymentId = paymentRes.rows[0].id;
      clientSecret = intent.client_secret;

      await client.query(
        `UPDATE orders
         SET payment_provider = 'stripe',
             payment_reference = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [orderId, paymentId],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      paymentId,
      clientSecret,
      amount: order.totalAmount,
      currency: order.currency,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Applies the outcome of a Stripe PaymentIntent to the payment/order rows.
// Shared by the webhook and by on-demand reconciliation so results are
// identical (and idempotent) regardless of which path observes it first.
async function applyPaymentIntentResult(paymentIntent, eventType) {
  if (eventType === "payment_intent.succeeded") {
    const updateRes = await pool.query(
      `UPDATE payments
       SET status = 'captured',
           failure_message = NULL,
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1
       RETURNING order_id AS "orderId"`,
      [paymentIntent.id],
    );

    if (updateRes.rowCount > 0) {
      const orderId = updateRes.rows[0].orderId;

      const orderUpdateRes = await pool.query(
        `UPDATE orders
         SET payment_status = 'paid',
             status = CASE WHEN status = 'pending' THEN 'paid' ELSE status END,
             updated_at = NOW()
         WHERE id = $1
         RETURNING user_id AS "userId"`,
        [orderId],
      );

      if (orderUpdateRes.rowCount > 0) {
        // Remove only the purchased items from the customer's cart, so items
        // added after placing the order are preserved.
        await pool.query(
          `DELETE FROM cart_items
           WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)
             AND product_id IN (
               SELECT product_id FROM order_items WHERE order_id = $2
             )`,
          [orderUpdateRes.rows[0].userId, orderId],
        );
      }
    }
  } else if (eventType === "payment_intent.payment_failed") {
    const failureMessage =
      paymentIntent.last_payment_error?.message || "Payment failed";

    const updateRes = await pool.query(
      `UPDATE payments
       SET status = 'failed',
           failure_message = $2,
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1
       RETURNING order_id AS "orderId"`,
      [paymentIntent.id, failureMessage],
    );

    if (updateRes.rowCount > 0) {
      await pool.query(
        `UPDATE orders
         SET payment_status = 'failed',
             updated_at = NOW()
         WHERE id = $1`,
        [updateRes.rows[0].orderId],
      );
    }
  }
}

// Asks Stripe directly for the PaymentIntent state and applies it. This makes
// the payment result independent of webhook delivery (e.g. `stripe listen`
// not running or a stale signing secret).
async function reconcilePayment(payment) {
  if (!payment.stripePaymentIntentId) return payment.status;
  const intent = await stripeClient.paymentIntents.retrieve(
    payment.stripePaymentIntentId,
  );
  if (intent.status === "succeeded") {
    await applyPaymentIntentResult(intent, "payment_intent.succeeded");
  } else if (
    intent.status === "requires_payment_method" &&
    intent.last_payment_error
  ) {
    await applyPaymentIntentResult(intent, "payment_intent.payment_failed");
  } else {
    return payment.status;
  }
  const res = await pool.query(`SELECT status FROM payments WHERE id = $1`, [
    payment.id,
  ]);
  return res.rows[0]?.status ?? payment.status;
}
// Retrieves a specific payment by ID, ensuring the user has access rights.
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
       stripe_payment_intent_id AS "stripePaymentIntentId",
       failure_message AS "failureMessage",
       created_at AS "createdAt",
       updated_at AS "updatedAt"
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

  if (!isStaff(role) && order.userId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (payment.status === "pending" || payment.status === "authorized") {
    try {
      await reconcilePayment(payment);
      const refreshed = await pool.query(
        `SELECT status, failure_message AS "failureMessage", updated_at AS "updatedAt"
         FROM payments WHERE id = $1`,
        [paymentId],
      );
      Object.assign(payment, refreshed.rows[0]);
    } catch (error) {
      console.error("Payment reconciliation failed:", error.message);
    }
  }

  delete payment.stripePaymentIntentId;
  res.json(payment);
}

// Handles Stripe webhook events. This is the authoritative place where a
// payment/order is marked as paid or failed - never the frontend's
// `stripe.confirmPayment` response, since that can be interrupted (e.g. the
// user closes the tab during 3D Secure) without Stripe ever hearing back
// from us otherwise.
//
// Mounted in app.js with `express.raw()` so `req.body` here is the exact
// raw Buffer Stripe signed.
export async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error.message,
    );
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    await applyPaymentIntentResult(event.data.object, event.type);
  } catch (error) {
    console.error("Failed to process Stripe webhook event:", error);
    // Return 500 so Stripe retries delivery.
    return res.status(500).json({ error: "Failed to process webhook event" });
  }
  res.json({ received: true });
}
