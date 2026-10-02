import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { fetchOrder } from "../api/orders.js";
import { createPaymentIntent, fetchPayment } from "../api/payments.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import { formatMoney } from "../utils/formatMoney.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { assignOrder, fetchUsers } from "../api/admin.js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 20000;

export default function CheckoutPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [needsAssignee, setNeedsAssignee] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const fetchedOrder = await fetchOrder(orderId);
        if (!isMounted) return;
        setOrder(fetchedOrder);

        if (fetchedOrder.paymentStatus === "paid") {
          navigate(`/orders/${orderId}`, { replace: true });
          return;
        }

        if (isAdmin) {
          const allUsers = await fetchUsers();
          if (!isMounted) return;
          setUsers(allUsers.filter((u) => u.isActive));
          setAssigneeId(fetchedOrder.userId || "");
          setNeedsAssignee(true);
          return;
        }

        const intent = await createPaymentIntent(orderId);
        if (!isMounted) return;
        setPaymentId(intent.paymentId);
        setClientSecret(intent.clientSecret);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [orderId, navigate, isAdmin]);

  async function handleAssign(event) {
    event.preventDefault();
    setIsAssigning(true);
    setError(null);
    try {
      if (assigneeId && assigneeId !== order.userId) {
        const updated = await assignOrder(orderId, assigneeId);
        setOrder((prev) => ({ ...prev, ...updated }));
      }
      const intent = await createPaymentIntent(orderId);
      setPaymentId(intent.paymentId);
      setClientSecret(intent.clientSecret);
      setNeedsAssignee(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Preparing checkout…" />;
  }

  if (error && !needsAssignee) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-0">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (order && needsAssignee) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-0">
        <h1 className="font-display text-2xl font-bold text-slate-900">Assign order</h1>
        <p className="mt-1 text-sm text-slate-500">
          Order #{order.id.slice(0, 8)} &middot; {formatMoney(order.totalAmount, order.currency)}
        </p>
        {error && <Alert variant="error">{error}</Alert>}
        <form
          onSubmit={handleAssign}
          aria-label="Assign order"
          className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label htmlFor="assignee" className="text-sm font-medium text-slate-700">
            Assign to user and pay on their behalf
          </label>
          <select
            id="assignee"
            required
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>Select a user…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ? `${u.name} (${u.email})` : u.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isAssigning || !assigneeId}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isAssigning ? "Preparing…" : "Assign & continue"}
          </button>
        </form>
      </div>
    );
  }

  if (!order || !clientSecret) return null;

  const options = { clientSecret, appearance: { theme: "stripe" } };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-0">
      <h1 className="font-display text-2xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">
        Order #{order.id.slice(0, 8)} &middot;{" "}
        {formatMoney(order.totalAmount, order.currency)}
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm orderId={orderId} paymentId={paymentId} />
        </Elements>
      </div>
    </div>
  );
}

function PaymentForm({ orderId, paymentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { refresh: refreshCart } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);

  const pollForOutcome = useCallback(async () => {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    setIsConfirming(true);
    try {
      while (Date.now() < deadline) {
        const payment = await fetchPayment(paymentId);
        if (payment.status === "captured") {
          // The webhook clears the purchased items from the cart once
          // payment is confirmed - refresh local cart state so the navbar
          // badge/cart page reflect that immediately instead of going stale
          // until the next unrelated cart action.
          await refreshCart();
          navigate(`/orders/${orderId}`, { replace: true });
          return;
        }
        if (payment.status === "failed" || payment.status === "canceled") {
          setError(
            payment.failureMessage ||
              "Payment failed. Please try again with a different card.",
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      setError(
        "We're still confirming your payment. Check your order history shortly for the final status.",
      );
    } finally {
      setIsConfirming(false);
    }
  }, [paymentId, orderId, navigate, refreshCart]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    setIsSubmitting(false);

    if (confirmError) {
      setError(confirmError.message || "Payment failed. Please try again.");
      return;
    }

    // Stripe's client-side result is informational only - poll our backend,
    // which reconciles the payment with Stripe (webhook or direct lookup).
    await pollForOutcome();
  }

  const busy = isSubmitting || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && <Alert variant="error">{error}</Alert>}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="mt-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Processing…" : isConfirming ? "Confirming payment…" : "Pay now"}
      </button>
    </form>
  );
}
