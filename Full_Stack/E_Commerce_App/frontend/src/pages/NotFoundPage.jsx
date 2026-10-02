import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-5xl font-bold text-slate-900">404</h1>
      <p className="text-slate-500">
        We couldn&rsquo;t find the page you were looking for.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        Back to home
      </Link>
    </div>
  );
}
