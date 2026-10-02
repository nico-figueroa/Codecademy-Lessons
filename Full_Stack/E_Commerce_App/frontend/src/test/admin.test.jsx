import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp, ADMIN, CUSTOMER, PRODUCTS } from "./helpers.jsx";
import * as admin from "../api/admin.js";
import * as orders from "../api/orders.js";

vi.mock("../api/auth.js");
vi.mock("../api/carts.js");
vi.mock("../api/orders.js");
vi.mock("../api/products.js");
vi.mock("../api/payments.js");
vi.mock("../api/admin.js");
beforeEach(() => vi.resetAllMocks());

describe("Admin: products", () => {
  beforeEach(() => {
    admin.fetchAllProducts.mockResolvedValue([...PRODUCTS, { id: "p3", name: "Retired Tablet", sku: "T-1", price: 1, currency: "USD", stock: 0, isActive: false }]);
  });

  it("adds a product", async () => {
    admin.createProduct.mockResolvedValue({});
    renderApp("/admin/products", { user: ADMIN });
    await userEvent.type(await screen.findByLabelText("Name"), "New Gadget");
    await userEvent.type(screen.getByLabelText("SKU"), "NG-1");
    await userEvent.type(screen.getByLabelText("Price"), "19.99");
    await userEvent.clear(screen.getByLabelText("Stock"));
    await userEvent.type(screen.getByLabelText("Stock"), "7");
    await userEvent.click(screen.getByRole("button", { name: "Add product" }));
    await waitFor(() =>
      expect(admin.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: "New Gadget", sku: "NG-1", price: 19.99, stock: 7 }),
      ),
    );
  });

  it("edits a product", async () => {
    admin.updateProduct.mockResolvedValue({});
    renderApp("/admin/products", { user: ADMIN });
    await userEvent.click(await screen.findByRole("button", { name: "Edit Quantum Laptop" }));
    const name = screen.getByLabelText("Name");
    expect(name).toHaveValue("Quantum Laptop");
    await userEvent.clear(name);
    await userEvent.type(name, "Quantum Laptop Pro");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(admin.updateProduct).toHaveBeenCalledWith("p1", expect.objectContaining({ name: "Quantum Laptop Pro" })),
    );
  });

  it("removes and restores products", async () => {
    admin.deactivateProduct.mockResolvedValue();
    admin.updateProduct.mockResolvedValue({});
    renderApp("/admin/products", { user: ADMIN });
    await userEvent.click(await screen.findByRole("button", { name: "Remove Quantum Laptop" }));
    expect(admin.deactivateProduct).toHaveBeenCalledWith("p1");
    await userEvent.click(screen.getByRole("button", { name: "Restore Retired Tablet" }));
    expect(admin.updateProduct).toHaveBeenCalledWith("p3", { isActive: true });
  });
});

describe("Admin: orders", () => {
  const list = [
    { id: "aaaaaaaa-1", status: "pending", paymentStatus: "unpaid", totalAmount: 10, currency: "USD", createdAt: "2025-01-01T00:00:00Z" },
    { id: "bbbbbbbb-2", status: "paid", paymentStatus: "paid", totalAmount: 20, currency: "USD", createdAt: "2025-01-02T00:00:00Z" },
  ];

  beforeEach(() => orders.fetchOrders.mockResolvedValue(list));

  it("changes an order status", async () => {
    admin.updateOrderStatus.mockResolvedValue({});
    renderApp("/admin/orders", { user: ADMIN });
    const select = await screen.findByLabelText("Status for order aaaaaaaa");
    expect(within(select).getAllByRole("option").map((o) => o.value)).toEqual([
      "pending", "paid", "shipped", "completed", "cancelled",
    ]);
    await userEvent.selectOptions(select, "completed");
    expect(admin.updateOrderStatus).toHaveBeenCalledWith("aaaaaaaa-1", "completed");
  });

  it("offers payment for pending orders and shipment for paid orders", async () => {
    admin.createShipment.mockResolvedValue({});
    renderApp("/admin/orders", { user: ADMIN });
    expect(await screen.findByRole("link", { name: "Take payment" })).toHaveAttribute("href", "/checkout/aaaaaaaa-1");
    await userEvent.click(screen.getByRole("button", { name: "Create shipment" }));
    expect(admin.createShipment).toHaveBeenCalledWith("bbbbbbbb-2");
  });
});

describe("Order detail", () => {
  it("shows delivery address, shipment and the shipped status", async () => {
    orders.fetchOrder.mockResolvedValue({
      id: "cccccccc-3", status: "shipped", paymentStatus: "paid", totalAmount: 10, currency: "USD",
      createdAt: "2025-01-01T00:00:00Z", items: [],
      shippingAddress: { name: "Casey Customer", line1: "1 Main St", city: "Austin", state: "TX", postalCode: "78701", country: "US" },
      shipment: { carrier: "USPS", trackingNumber: "TRK123", labelUrl: "https://example.com/label.pdf" },
    });
    renderApp("/orders/cccccccc-3", { user: CUSTOMER });
    expect(await screen.findByText(/1 Main St/)).toBeInTheDocument();
    expect(screen.getByText(/TRK123/)).toBeInTheDocument();
    expect(screen.getByText("shipped")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shipping label/i })).toBeInTheDocument();
  });

  it("lists order history", async () => {
    orders.fetchOrders.mockResolvedValue([
      { id: "dddddddd-4", status: "completed", paymentStatus: "paid", totalAmount: 5, currency: "USD", createdAt: "2025-01-01T00:00:00Z" },
    ]);
    renderApp("/orders", { user: CUSTOMER });
    expect(await screen.findByText(/dddddddd/)).toBeInTheDocument();
  });
});

describe("Vendor access", () => {
  const VENDOR = { ...CUSTOMER, id: "u3", email: "vendor@example.com", role: "vendor" };

  it("sees product and order management but not user management", async () => {
    admin.fetchAllProducts.mockResolvedValue(PRODUCTS);
    renderApp("/admin/products", { user: VENDOR });
    expect(await screen.findByRole("link", { name: "Manage products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manage orders" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Manage users" })).not.toBeInTheDocument();
  });
});
