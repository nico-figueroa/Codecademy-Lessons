import { Link } from "react-router-dom";
import { formatMoney } from "../utils/formatMoney.js";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80";

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold text-slate-900">
          {product.name}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-slate-500">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-semibold text-indigo-600">
            {formatMoney(product.price, product.currency)}
          </span>
          {outOfStock ? (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
              Out of stock
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
              In stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
