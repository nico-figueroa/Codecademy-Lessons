import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders, fetchOrder } from "../api/orders.js";
import { createShipment, updateOrderStatus } from "../api/admin.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import OrderEditor from "../components/OrderEditor.jsx";
import { ORDER_STATUSES, STATUS_STYLES } from "../utils/orderStatus.js";
import { formatMoney } from "../utils/formatMoney.js";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchOrders();
      setOrders(list);
      const details = await Promise.all(
        list.filter((o) => o.status === "shipped" || o.status === "completed")
          .map((o) => fetchOrder(o.id).catch(() => null)),
      );
      setShipments(
        Object.fromEntries(details.filter(Boolean).map((o) => [o.id, o.shipment])),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action) {
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (isLoading) return <LoadingSpinner label="Loading orders…" />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Manage orders</h1>
      {error && <Alert variant="error">{error}</Alert>}

      {orders.length === 0 ? (
        <p className="mt-8 text-slate-500">No orders yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {orders.map((o) => {
            const shipment = shipments[o.id];
            const canShip = (o.status === "paid") && !shipment;
            return (
              <li key={o.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <Link to={`/orders/${o.id}`} className="font-medium text-indigo-600 hover:underline">
                    Order #{o.id.slice(0, 8)}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                    {formatMoney(o.totalAmount, o.currency)} · payment {o.paymentStatus}
                  </p>
                  {shipment && (
                    <p className="text-sm text-slate-500">
                      {shipment.carrier} · tracking {shipment.trackingNumber}
                    </p>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[o.status] || ""}`}>
                  {o.status}
                </span>
                <select
                  aria-label={`Status for order ${o.id.slice(0, 8)}`}
                  value={o.status}
                  onChange={(e) => run(() => updateOrderStatus(o.id, e.target.value))}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm capitalize"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {o.status === "pending" && o.paymentStatus !== "paid" && (
                  <Link to={`/checkout/${o.id}`}
                    className="rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                    Take payment
                  </Link>
                )}
                {canShip && (
                  <button type="button" onClick={() => run(() => createShipment(o.id))}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                    Create shipment
                  </button>
                )}
                <button type="button" aria-expanded={editingId === o.id}
                  onClick={() => setEditingId(editingId === o.id ? null : o.id)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {editingId === o.id ? "Close" : `Edit order ${o.id.slice(0, 8)}`}
                </button>
                {editingId === o.id && (
                  <div className="-mx-5 -mb-5 basis-full">
                    <OrderEditor orderId={o.id} onSaved={load} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
