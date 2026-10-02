import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../api/orders.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import { formatMoney } from "../utils/formatMoney.js";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  fulfilled: "bg-indigo-100 text-indigo-800",
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Loading your orders…" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">
        Order history
      </h1>

      {error && <Alert variant="error">{error}</Alert>}

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-500">You haven&rsquo;t placed any orders yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Placed {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      STATUS_STYLES[order.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(order.totalAmount, order.currency)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
