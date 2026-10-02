import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  deactivateProduct,
  fetchAllProducts,
  updateProduct,
} from "../api/admin.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";
import { formatMoney } from "../utils/formatMoney.js";

const EMPTY = { name: "", sku: "", description: "", price: "", stock: "0", imageUrl: "" };

function toPayload(form) {
  const payload = {
    name: form.name.trim(),
    sku: form.sku.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    stock: Number.parseInt(form.stock, 10) || 0,
  };
  if (form.imageUrl.trim()) payload.imageUrl = form.imageUrl.trim();
  return payload;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setProducts(await fetchAllProducts());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      imageUrl: product.imageUrl || "",
    });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateProduct(editingId, toPayload(form));
      } else {
        await createProduct(toPayload(form));
      }
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function run(action) {
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Manage products</h1>
      {error && <Alert variant="error">{error}</Alert>}

      <form
        onSubmit={handleSubmit}
        aria-label="Product form"
        className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
      >
        <h2 className="font-display text-lg font-semibold sm:col-span-2">
          {editingId ? "Edit product" : "Add product"}
        </h2>
        <div>
          <label htmlFor="p-name" className="text-sm font-medium text-slate-700">Name</label>
          <input id="p-name" required className={input} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="p-sku" className="text-sm font-medium text-slate-700">SKU</label>
          <input id="p-sku" required className={input} value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
        <div>
          <label htmlFor="p-price" className="text-sm font-medium text-slate-700">Price</label>
          <input id="p-price" required type="number" min="0" step="0.01" className={input}
            value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div>
          <label htmlFor="p-stock" className="text-sm font-medium text-slate-700">Stock</label>
          <input id="p-stock" required type="number" min="0" step="1" className={input}
            value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-image" className="text-sm font-medium text-slate-700">Image URL</label>
          <input id="p-image" type="url" className={input} value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-desc" className="text-sm font-medium text-slate-700">Description</label>
          <textarea id="p-desc" rows={3} className={input} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {editingId ? "Save changes" : "Add product"}
          </button>
          {editingId && (
            <button type="button" onClick={reset}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700">
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <LoadingSpinner label="Loading products…" />
      ) : (
        <ul className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {products.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {p.name}
                  {!p.isActive && (
                    <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs">Inactive</span>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  {p.sku} · {formatMoney(p.price, p.currency)} · {p.stock} in stock
                </p>
              </div>
              <button type="button" onClick={() => startEdit(p)}
                aria-label={`Edit ${p.name}`}
                className="text-sm font-medium text-indigo-600 hover:underline">
                Edit
              </button>
              {p.isActive ? (
                <button type="button" onClick={() => run(() => deactivateProduct(p.id))}
                  aria-label={`Remove ${p.name}`}
                  className="text-sm font-medium text-rose-600 hover:underline">
                  Remove
                </button>
              ) : (
                <button type="button" onClick={() => run(() => updateProduct(p.id, { isActive: true }))}
                  aria-label={`Restore ${p.name}`}
                  className="text-sm font-medium text-emerald-600 hover:underline">
                  Restore
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
