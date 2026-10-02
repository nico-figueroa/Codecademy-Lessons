import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cancelOrder, fetchOrder } from "../api/orders.js";
import { fetchProducts } from "../api/products.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import { formatMoney } from "../utils/formatMoney.js";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  fulfilled: "bg-indigo-100 text-indigo-800",
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [productsById, setProductsById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [fetchedOrder, products] = await Promise.all([
          fetchOrder(orderId),
          fetchProducts().catch(() => []),
        ]);
        if (!isMounted) return;
        setOrder(fetchedOrder);
        setProductsById(Object.fromEntries(products.map((p) => [p.id, p])));
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
  }, [orderId]);

  async function handleCancel() {
    setIsCancelling(true);
    setError(null);
    try {
      await cancelOrder(orderId);
      const refreshed = await fetchOrder(orderId);
      setOrder(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading order…" />;
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-0">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!order) return null;

  const canCancel = order.status === "pending" || order.status === "paid";
  const canPay = order.status === "pending" && order.paymentStatus !== "paid";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/orders" className="text-sm font-medium text-indigo-600 hover:underline">
        &larr; Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
            STATUS_STYLES[order.status] || "bg-slate-100 text-slate-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <ul className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {order.items?.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-medium text-slate-900">
                {productsById[item.productId]?.name ||
                  `Product #${item.productId.slice(0, 8)}`}
              </p>
              <p className="text-sm text-slate-500">
                {item.quantity} × {formatMoney(item.unitPrice, item.currency)}
              </p>
            </div>
            <p className="font-semibold text-slate-900">
              {formatMoney(item.unitPrice * item.quantity, item.currency)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-sm text-slate-500">Payment status</p>
          <p className="font-medium capitalize text-slate-900">{order.paymentStatus}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatMoney(order.totalAmount, order.currency)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {canPay && (
          <button
            type="button"
            onClick={() => navigate(`/checkout/${order.id}`)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Complete payment
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isCancelling}
            className="rounded-lg border border-rose-300 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            {isCancelling ? "Cancelling…" : "Cancel order"}
          </button>
        )}
      </div>
    </div>
  );
}
