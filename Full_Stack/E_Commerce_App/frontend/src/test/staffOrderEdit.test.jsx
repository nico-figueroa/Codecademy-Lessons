import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp, ADMIN, PRODUCTS } from "./helpers.jsx";
import * as admin from "../api/admin.js";
import * as orders from "../api/orders.js";

vi.mock("../api/auth.js");
vi.mock("../api/carts.js");
vi.mock("../api/orders.js");
vi.mock("../api/products.js");
vi.mock("../api/payments.js");
vi.mock("../api/admin.js");
beforeEach(() => vi.resetAllMocks());

const VENDOR = { ...ADMIN, id: "v1", email: "vendor@example.com", role: "vendor" };
const ADDRESS = { name: "Ann", line1: "1 Main St", city: "Austin", state: "TX", postalCode: "78701", country: "US" };

function setup(user, order = {}) {
  orders.fetchOrders.mockResolvedValue([
    { id: "aaaaaaaa-1", status: "pending", paymentStatus: "unpaid", totalAmount: 10, currency: "USD", createdAt: "2025-01-01T00:00:00Z" },
  ]);
  orders.fetchOrder.mockResolvedValue({
    id: "aaaaaaaa-1", userId: "u1", status: "pending", paymentStatus: "unpaid",
    shippingAddress: ADDRESS, shipment: null,
    items: [{ productId: "p1", quantity: 1 }], ...order,
  });
  admin.fetchUserLookup.mockResolvedValue([
    { id: "u1", name: "Ann", email: "ann@example.com" },
    { id: "u2", name: "Bob", email: "bob@example.com" },
  ]);
  admin.fetchAllProducts.mockResolvedValue(PRODUCTS.map((p) => ({ ...p, isActive: true })));
  admin.updateOrder.mockResolvedValue({});
  return renderApp("/admin/orders", { user });
}

async function openEditor() {
  await userEvent.click(await screen.findByRole("button", { name: /Edit order aaaaaaaa/ }));
  await screen.findByLabelText("Customer");
}

describe("Staff order editing", () => {
  it("reassigns the customer and edits quantities", async () => {
    setup(ADMIN);
    await openEditor();
    await userEvent.selectOptions(screen.getByLabelText("Customer"), "u2");
    const qty = screen.getByLabelText("Quantity for Quantum Laptop");
    await userEvent.clear(qty);
    await userEvent.type(qty, "3");
    await userEvent.click(screen.getByRole("button", { name: "Save order" }));
    await waitFor(() =>
      expect(admin.updateOrder).toHaveBeenCalledWith(
        "aaaaaaaa-1",
        expect.objectContaining({ userId: "u2", items: [{ productId: "p1", quantity: 3 }] }),
      ),
    );
  });

  it("lets admin change payment status", async () => {
    setup(ADMIN);
    await openEditor();
    await userEvent.selectOptions(screen.getByLabelText("Payment status"), "paid");
    await userEvent.click(screen.getByRole("button", { name: "Save order" }));
    await waitFor(() =>
      expect(admin.updateOrder).toHaveBeenCalledWith("aaaaaaaa-1", expect.objectContaining({ paymentStatus: "paid" })),
    );
  });

  it("hides payment status from vendors", async () => {
    setup(VENDOR);
    await openEditor();
    expect(screen.queryByLabelText("Payment status")).not.toBeInTheDocument();
  });

  it("adds a manual shipment on a paid order", async () => {
    admin.createManualShipment.mockResolvedValue({});
    setup(VENDOR, { status: "paid", paymentStatus: "paid" });
    await openEditor();
    await userEvent.type(screen.getByLabelText("Carrier"), "UPS");
    await userEvent.type(screen.getByLabelText("Tracking number"), "1Z999");
    await userEvent.click(screen.getByRole("button", { name: "Add shipment manually" }));
    await waitFor(() =>
      expect(admin.createManualShipment).toHaveBeenCalledWith("aaaaaaaa-1", expect.objectContaining({ carrier: "UPS", trackingNumber: "1Z999" })),
    );
  });

  it("updates and removes an existing shipment", async () => {
    admin.updateShipment.mockResolvedValue({});
    admin.deleteShipment.mockResolvedValue();
    setup(ADMIN, { status: "shipped", paymentStatus: "paid", shipment: { carrier: "UPS", trackingNumber: "1Z", status: "pre_transit" } });
    await openEditor();
    await userEvent.selectOptions(screen.getByLabelText("Shipment status"), "delivered");
    await userEvent.click(screen.getByRole("button", { name: "Save shipment" }));
    await waitFor(() =>
      expect(admin.updateShipment).toHaveBeenCalledWith("aaaaaaaa-1", expect.objectContaining({ status: "delivered" })),
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove shipment" }));
    await waitFor(() => expect(admin.deleteShipment).toHaveBeenCalledWith("aaaaaaaa-1"));
  });
});
