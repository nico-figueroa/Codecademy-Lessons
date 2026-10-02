import { useEffect, useState } from "react";
import { fetchOrder } from "../api/orders.js";
import {
  fetchAllProducts,
  fetchUserLookup,
  updateOrder,
  createManualShipment,
  updateShipment,
  deleteShipment,
} from "../api/admin.js";
import { useAuth } from "../context/AuthContext.jsx";
import AddressForm from "./AddressForm.jsx";
import Alert from "./Alert.jsx";
import { EMPTY_ADDRESS, cleanAddress } from "../utils/address.js";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const primary =
  "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50";

const EMPTY_SHIPMENT = { carrier: "", service: "", trackingNumber: "", trackingUrl: "", status: "pre_transit" };

// Staff editor for an order: customer, delivery address, quantities,
// payment status (admin only) and shipment details.
export default function OrderEditor({ orderId, onSaved }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [order, setOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [quantities, setQuantities] = useState({});
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [shipment, setShipment] = useState(EMPTY_SHIPMENT);
  const [addProductId, setAddProductId] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [o, c, p] = await Promise.all([
      fetchOrder(orderId),
      fetchUserLookup(),
      fetchAllProducts(),
    ]);
    setOrder(o);
    setCustomers(c);
    setProducts(p);
    setOwnerId(o.userId);
    setAddress({ ...EMPTY_ADDRESS, ...(o.shippingAddress || {}) });
    setQuantities(Object.fromEntries((o.items || []).map((i) => [i.productId, i.quantity])));
    setPaymentStatus(o.paymentStatus);
    setShipment(o.shipment ? { ...EMPTY_SHIPMENT, ...o.shipment } : EMPTY_SHIPMENT);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!order) return error ? <Alert variant="error">{error}</Alert> : <p className="p-4 text-sm text-slate-500">Loading…</p>;

  const itemsEditable = order.status === "pending" && order.paymentStatus !== "paid";
  const nameOf = (id) => products.find((p) => p.id === id)?.name || id.slice(0, 8);

  async function guard(fn, message) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      await load();
      setNotice(message);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function saveOrder(e) {
    e.preventDefault();
    const changes = {};
    if (ownerId !== order.userId) changes.userId = ownerId;
    changes.shippingAddress = cleanAddress(address);
    if (itemsEditable) {
      const original = Object.fromEntries(order.items.map((i) => [i.productId, i.quantity]));
      const touched = Object.entries(quantities).filter(([id, q]) => (original[id] ?? 0) !== Number(q));
      if (touched.length > 0) {
        changes.items = Object.entries(quantities).map(([productId, q]) => ({ productId, quantity: Number(q) }));
      }
    }
    if (isAdmin && paymentStatus !== order.paymentStatus) changes.paymentStatus = paymentStatus;
    return guard(() => updateOrder(orderId, changes), "Order saved.");
  }

  function saveShipment(e) {
    e.preventDefault();
    const payload = {
      carrier: shipment.carrier,
      service: shipment.service || undefined,
      trackingNumber: shipment.trackingNumber,
      trackingUrl: shipment.trackingUrl || undefined,
    };
    return guard(
      () =>
        order.shipment
          ? updateShipment(orderId, { ...payload, status: shipment.status })
          : createManualShipment(orderId, payload),
      "Shipment saved.",
    );
  }

  const addable = products.filter((p) => p.isActive && !(p.id in quantities));

  return (
    <div className="space-y-6 border-t border-slate-200 bg-slate-50 p-5">
      {error && <Alert variant="error">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}

      <form onSubmit={saveOrder} className="space-y-5" aria-label="Edit order">
        <div>
          <label htmlFor={`owner-${orderId}`} className="block text-sm font-medium text-slate-700">Customer</label>
          <select id={`owner-${orderId}`} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}
            disabled={order.paymentStatus === "paid"} className={input}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name ? `${c.name} (${c.email})` : c.email}</option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-900">Items</legend>
          {!itemsEditable && (
            <p className="text-xs text-slate-500">Quantities can only be edited on unpaid pending orders.</p>
          )}
          <ul className="mt-2 space-y-2">
            {Object.entries(quantities).map(([id, q]) => (
              <li key={id} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-slate-700">{nameOf(id)}</span>
                <input type="number" min="0" aria-label={`Quantity for ${nameOf(id)}`} value={q}
                  disabled={!itemsEditable}
                  onChange={(e) => setQuantities({ ...quantities, [id]: e.target.value })}
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
              </li>
            ))}
          </ul>
          {itemsEditable && addable.length > 0 && (
            <div className="mt-3 flex gap-2">
              <select aria-label="Product to add" value={addProductId} onChange={(e) => setAddProductId(e.target.value)} className={input}>
                <option value="">Add a product…</option>
                {addable.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="button" disabled={!addProductId}
                onClick={() => { setQuantities({ ...quantities, [addProductId]: 1 }); setAddProductId(""); }}
                className="mt-1 rounded-lg border border-slate-300 px-3 text-sm font-medium hover:bg-white disabled:opacity-50">
                Add
              </button>
            </div>
          )}
          <p className="mt-1 text-xs text-slate-500">Set a quantity to 0 to remove a line.</p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-900">Delivery address</legend>
          <AddressForm value={address} onChange={setAddress} />
        </fieldset>

        {isAdmin && (
          <div>
            <label htmlFor={`pay-${orderId}`} className="block text-sm font-medium text-slate-700">Payment status</label>
            <select id={`pay-${orderId}`} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={input}>
              <option value="unpaid">unpaid</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={busy} className={primary}>Save order</button>
      </form>

      <form onSubmit={saveShipment} className="space-y-3" aria-label="Edit shipment">
        <h3 className="text-sm font-semibold text-slate-900">Shipment</h3>
        {["paid", "shipped", "completed"].includes(order.status) || order.shipment ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[["carrier", "Carrier"], ["service", "Service"], ["trackingNumber", "Tracking number"], ["trackingUrl", "Tracking URL"]].map(([k, label]) => (
                <div key={k}>
                  <label htmlFor={`ship-${k}-${orderId}`} className="block text-sm font-medium text-slate-700">{label}</label>
                  <input id={`ship-${k}-${orderId}`} value={shipment[k] ?? ""} required={k === "carrier" || k === "trackingNumber"}
                    onChange={(e) => setShipment({ ...shipment, [k]: e.target.value })} className={input} />
                </div>
              ))}
              {order.shipment && (
                <div>
                  <label htmlFor={`ship-status-${orderId}`} className="block text-sm font-medium text-slate-700">Shipment status</label>
                  <select id={`ship-status-${orderId}`} value={shipment.status}
                    onChange={(e) => setShipment({ ...shipment, status: e.target.value })} className={input}>
                    {["pre_transit", "in_transit", "delivered", "failed"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className={primary}>
                {order.shipment ? "Save shipment" : "Add shipment manually"}
              </button>
              {order.shipment && (
                <button type="button" disabled={busy}
                  onClick={() => guard(() => deleteShipment(orderId), "Shipment removed.")}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  Remove shipment
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Shipments can be added once the order is paid.</p>
        )}
      </form>
    </div>
  );
}
