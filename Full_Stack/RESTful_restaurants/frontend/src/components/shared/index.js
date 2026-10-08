export const inputClassName =
  "mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

export function PageHeading({ eyebrow, title, description, titleId }) {
  return (
    <div className="mb-7">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
        id={titleId}
      >
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">
        {description}
      </p>
    </div>
  );
}

export function ErrorNotice({ message, id }) {
  if (!message) return null;

  return (
    <p
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      id={id}
      role="alert"
    >
      {message}
    </p>
  );
}

export function EmptyState({ children }) {
  return (
    <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-8 text-center text-slate-700">
      {children}
    </p>
  );
}

export const errorMessage = (error) => {
  if (
    error &&
    typeof error === "object" &&
    typeof error.response?.data?.error === "string"
  ) {
    return error.response.data.error;
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
};
