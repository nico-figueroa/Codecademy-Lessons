import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";
import { fetchCurrentUser } from "../api/auth.js";
import { fetchCart } from "../api/carts.js";
import { fetchProducts } from "../api/products.js";
import { setStoredToken } from "../api/client.js";

export const CUSTOMER = {
  id: "u1",
  email: "customer@example.com",
  name: "Casey Customer",
  phone: "555-0100",
  role: "customer",
  address: { line1: "1 Main St", line2: "", city: "Austin", state: "TX", postalCode: "78701", country: "US" },
};
export const ADMIN = { ...CUSTOMER, id: "u2", email: "admin@example.com", name: "Ada Admin", role: "admin" };

export const PRODUCTS = [
  { id: "p1", name: "Quantum Laptop", description: "Fast", sku: "LAP-1", price: 999, currency: "USD", stock: 5, isActive: true },
  { id: "p2", name: "Sold Out Phone", description: "Gone", sku: "PH-1", price: 500, currency: "USD", stock: 0, isActive: true },
];

export const EMPTY_CART = { id: "c1", items: [], totalAmount: 0, currency: "USD" };

// Renders the whole app at `route`, optionally signed in as `user`.
export function renderApp(route = "/", { user = null, cart = EMPTY_CART } = {}) {
  if (user) {
    setStoredToken("test-token");
    fetchCurrentUser.mockResolvedValue(user);
  }
  fetchCart.mockResolvedValue(cart);
  fetchProducts.mockResolvedValue(PRODUCTS);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}
