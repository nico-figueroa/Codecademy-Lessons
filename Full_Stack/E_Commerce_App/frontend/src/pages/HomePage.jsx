import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products.js";
import ProductCard from "../components/ProductCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Alert from "../components/Alert.jsx";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchProducts()
      .then((data) => {
        if (isMounted) setProducts(data);
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
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-6 py-12 text-white sm:px-10">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Gear for your next summit.
        </h1>
        <p className="mt-3 max-w-xl text-indigo-100">
          Hand-picked outdoor and travel essentials. Browse freely — sign in
          only when you&rsquo;re ready to add items to your cart or check
          out.
        </p>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {isLoading ? (
        <LoadingSpinner label="Loading products…" />
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-slate-500">
          No products are available right now. Please check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
