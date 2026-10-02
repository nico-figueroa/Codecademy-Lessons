import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp, ADMIN, CUSTOMER } from "./helpers.jsx";
import * as admin from "../api/admin.js";
import * as orders from "../api/orders.js";
import * as payments from "../api/payments.js";

vi.mock("../api/auth.js");
vi.mock("../api/carts.js");
vi.mock("../api/orders.js");
vi.mock("../api/products.js");
vi.mock("../api/payments.js");
vi.mock("../api/admin.js");
vi.mock("@stripe/stripe-js", () => ({ loadStripe: () => Promise.resolve({}) }));
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => children,
  PaymentElement: () => <div>card-field</div>,
  useStripe: () => ({ confirmPayment: vi.fn() }),
  useElements: () => ({}),
}));

const gone = { id: "u9", email: "gone@example.com", name: "", role: "customer", isActive: false };
const USERS = [
  { ...ADMIN, isActive: true },
  { ...CUSTOMER, isActive: true },
  gone,
];

beforeEach(() => {
  vi.resetAllMocks();
  admin.fetchUsers.mockResolvedValue(USERS);
});

describe("Admin: users", () => {
  it("lists users including inactive ones", async () => {
    renderApp("/admin/users", { user: ADMIN });
    expect((await screen.findAllByText("gone@example.com")).length).toBeGreaterThan(0);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("creates a user", async () => {
    admin.createUser.mockResolvedValue({});
    renderApp("/admin/users", { user: ADMIN });
    await userEvent.type(await screen.findByLabelText("Email"), "new@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "Password123!");
    await userEvent.click(screen.getByRole("button", { name: "Add user" }));
    await waitFor(() =>
      expect(admin.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@example.com", role: "customer", password: "Password123!" }),
      ),
    );
  });

  it("deactivates and reactivates users but not yourself", async () => {
    admin.deactivateUser.mockResolvedValue({});
    admin.updateUser.mockResolvedValue({});
    renderApp("/admin/users", { user: ADMIN });
    await screen.findAllByText("gone@example.com");
    expect(screen.getAllByRole("button", { name: "Deactivate" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(admin.deactivateUser).toHaveBeenCalledWith(CUSTOMER.id));
    await userEvent.click(screen.getByRole("button", { name: "Reactivate" }));
    await waitFor(() => expect(admin.updateUser).toHaveBeenCalledWith("u9", { isActive: true }));
  });

  it("is hidden from customers", async () => {
    renderApp("/admin/users", { user: CUSTOMER });
    await waitFor(() => expect(screen.queryByText("Manage users")).not.toBeInTheDocument());
  });
});

describe("Admin: pay on behalf of a user", () => {
  const order = { id: "eeeeeeee-5", userId: "u2", status: "pending", paymentStatus: "unpaid", totalAmount: 10, currency: "USD", items: [] };

  it("assigns the order to the chosen user, then shows the payment form", async () => {
    orders.fetchOrder.mockResolvedValue(order);
    admin.assignOrder.mockResolvedValue({ ...order, userId: CUSTOMER.id });
    payments.createPaymentIntent.mockResolvedValue({ paymentId: "pay1", clientSecret: "s" });
    renderApp("/checkout/eeeeeeee-5", { user: ADMIN });

    await userEvent.selectOptions(await screen.findByLabelText(/assign to user/i), CUSTOMER.id);
    expect(payments.createPaymentIntent).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Assign & continue" }));

    expect(await screen.findByText("card-field")).toBeInTheDocument();
    expect(admin.assignOrder).toHaveBeenCalledWith("eeeeeeee-5", CUSTOMER.id);
  });
});

