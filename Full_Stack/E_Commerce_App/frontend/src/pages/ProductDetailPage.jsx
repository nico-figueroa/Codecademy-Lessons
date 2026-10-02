import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProduct } from "../api/products.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import { formatMoney } from "../utils/formatMoney.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchProduct(productId)
      .then((data) => {
        if (isMounted) setProduct(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [productId]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await addItem(product.id, quantity);
      setNotice(`Added ${quantity} × ${product.name} to your cart.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading product…" />;
  }

  if (error && !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!product) return null;

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={product.imageUrl || FALLBACK_IMAGE}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-indigo-600">
            {formatMoney(product.price, product.currency)}
          </p>
          <p className="leading-relaxed text-slate-600">{product.description}</p>

          <p className="text-sm text-slate-500">
            {outOfStock ? (
              <span className="font-medium text-rose-600">Out of stock</span>
            ) : (
              <>
                <span className="font-medium text-emerald-600">In stock</span>{" "}
                — {product.stock} available
              </>
            )}
          </p>

          {notice && <Alert variant="success">{notice}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}

          <div className="mt-2 flex items-center gap-4">
            <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              disabled={outOfStock}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              {Array.from({ length: Math.min(10, Math.max(product.stock, 1)) }, (_, i) => i + 1).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || isSubmitting}
            className="mt-2 w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting
              ? "Adding…"
              : isAuthenticated
                ? "Add to cart"
                : "Log in to add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
