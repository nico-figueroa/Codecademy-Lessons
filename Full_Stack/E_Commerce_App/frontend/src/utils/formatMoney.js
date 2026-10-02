// Formats a numeric amount with the product's ISO currency code using the
// browser's Intl API (e.g. formatMoney(19.99, "USD") -> "$19.99").
export function formatMoney(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}
