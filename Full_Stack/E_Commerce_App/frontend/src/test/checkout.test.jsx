import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp, CUSTOMER } from "./helpers.jsx";
import * as orders from "../api/orders.js";
import * as payments from "../api/payments.js";
import * as carts from "../api/carts.js";

vi.mock("../api/auth.js");
vi.mock("../api/carts.js");
vi.mock("../api/orders.js");
vi.mock("../api/products.js");
vi.mock("../api/payments.js");
vi.mock("../api/admin.js");

const confirmPayment = vi.fn();
vi.mock("@stripe/stripe-js", () => ({ loadStripe: () => Promise.resolve({}) }));
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => children,
  PaymentElement: () => <div>card-field</div>,
  useStripe: () => ({ confirmPayment }),
  useElements: () => ({}),
}));

const order = { id: "eeeeeeee-5", status: "pending", paymentStatus: "unpaid", totalAmount: 10, currency: "USD", items: [] };
const cartWithItem = {
  id: "c1", currency: "USD", totalAmount: 10,
  items: [{ id: "i1", productId: "p1", quantity: 1, unitPrice: 10, currency: "USD" }],
};

async function pay() {
  renderApp("/checkout/eeeeeeee-5", { user: CUSTOMER, cart: cartWithItem });
  await userEvent.click(await screen.findByRole("button", { name: /pay/i }));
}

beforeEach(() => {
  vi.resetAllMocks();
  orders.fetchOrder.mockResolvedValue(order);
  payments.createPaymentIntent.mockResolvedValue({ paymentId: "pay1", clientSecret: "s" });
  confirmPayment.mockResolvedValue({});
});

describe("Checkout", () => {
  it("goes to the order once the payment is captured", async () => {
    payments.fetchPayment.mockResolvedValue({ status: "captured" });
    orders.fetchOrder.mockResolvedValueOnce(order).mockResolvedValue({ ...order, status: "paid", paymentStatus: "paid", shippingAddress: {} });
    await pay();
    expect(await screen.findByText(/order #eeeeeeee/i)).toBeInTheDocument();
    expect(payments.fetchPayment).toHaveBeenCalledWith("pay1");
  });

  it("shows the failure and keeps the cart on a declined card", async () => {
    payments.fetchPayment.mockResolvedValue({ status: "failed", failureMessage: "Your card was declined." });
    await pay();
    expect(await screen.findByText("Your card was declined.")).toBeInTheDocument();
    expect(carts.clearCart).not.toHaveBeenCalled();
  });

  it("shows Stripe's own error without polling", async () => {
    confirmPayment.mockResolvedValue({ error: { message: "Card number invalid" } });
    await pay();
    expect(await screen.findByText("Card number invalid")).toBeInTheDocument();
    expect(payments.fetchPayment).not.toHaveBeenCalled();
  });
});
