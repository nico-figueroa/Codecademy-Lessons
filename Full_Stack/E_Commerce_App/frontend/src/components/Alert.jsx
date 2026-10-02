const VARIANT_STYLES = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export default function Alert({ variant = "info", children, className = "" }) {
  if (!children) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
