import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { placeOrder } from "../api/orders.js";
import { fetchProducts } from "../api/products.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import AddressForm from "../components/AddressForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { addressFromProfile, cleanAddress } from "../utils/address.js";
import { formatMoney } from "../utils/formatMoney.js";

export default function CartPage() {
  const { cart, isLoading, error, updateItem, removeItem, refresh } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [address, setAddress] = useState(() => addressFromProfile(user));
  const [actionError, setActionError] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [productsById, setProductsById] = useState({});

  useEffect(() => {
    fetchProducts()
      .then((products) => {
        setProductsById(Object.fromEntries(products.map((p) => [p.id, p])));
      })
      .catch(() => {
        // Non-fatal: falls back to showing the raw product ID.
      });
  }, []);

  async function handleQuantityChange(itemId, quantity) {
    if (quantity < 1) return;
    setPendingItemId(itemId);
    setActionError(null);
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleRemove(itemId) {
    setPendingItemId(itemId);
    setActionError(null);
    try {
      await removeItem(itemId);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPendingItemId(null);
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    setIsPlacingOrder(true);
    setActionError(null);
    try {
      const order = await placeOrder(cleanAddress(address));
      await refresh();
      navigate(`/checkout/${order.id}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (isLoading && !cart) {
    return <LoadingSpinner label="Loading your cart…" />;
  }

  const items = cart?.items || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Your cart</h1>

      {error && <Alert variant="error">{error}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {productsById[item.productId]?.name ||
                      `Product #${item.productId.slice(0, 8)}`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatMoney(item.unitPrice, item.currency)} each
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={pendingItemId === item.id}
                    className="h-8 w-8 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={pendingItemId === item.id}
                    className="h-8 w-8 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <p className="w-24 text-right font-semibold text-slate-900">
                  {formatMoney(item.unitPrice * item.quantity, item.currency)}
                </p>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={pendingItemId === item.id}
                  className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handlePlaceOrder}
            className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Delivery address
              </h2>
              <div className="mt-4">
                <AddressForm value={address} onChange={setAddress} />
              </div>
            </div>
            <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Order total</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatMoney(cart.totalAmount, cart.currency)}
              </p>
            </div>
            <button
              type="submit"
              disabled={isPlacingOrder}
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isPlacingOrder ? "Placing order…" : "Place order"}
            </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
