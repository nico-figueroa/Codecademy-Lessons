import { z } from "zod";

// =========================
// AUTH
// =========================

// Validation schemas for request payloads using Zod
// Each schema corresponds to the expected structure of the request body or parameters for different API endpoints.

/**
 * RegisterSchema: Validates the request body for user registration.
 * Ensures that the email is a valid email address and the password has a minimum length of 8 characters.
 */
export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

/**
 * LoginSchema: Validates the request body for user login.
 * Ensures that the email is a valid email address and the password is provided.
 */
export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

/**
 * OAuthCallbackSchema: Validates the request body and parameters for OAuth callback.
 * Ensures that the state is a valid UUID and the provider is either 'google' or 'microsoft'.
 */
export const OAuthCallbackSchema = z.object({
  body: z.object({
    state: z.string().uuid(),
    mockSubject: z.string().min(1).optional(),
  }),
  params: z.object({
    provider: z.enum(["google", "microsoft"]),
  }),
});

/**
 * OAuthStartSchema: Validates the request parameters for starting an OAuth flow.
 * Ensures that the provider is either 'google' or 'microsoft'.
 */
export const OAuthStartSchema = z.object({
  params: z.object({
    provider: z.enum(["google", "microsoft"]),
  }),
});

// =========================
// USERS
// =========================
/**
 * UserCreateSchema: Validates the request body for creating a new user.
 * Ensures that the email is a valid email address, the password has a minimum length of 8 characters,
 * and the role is either 'customer', 'admin', or 'vendor' (optional).
 */
export const UserCreateSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["customer", "admin", "vendor"]).optional(),
  }),
});
/**
 * UserUpdateSchema: Validates the request body for updating an existing user.
 * Ensures that the email is a valid email address (optional), the role is either 'customer', 'admin', or 'vendor' (optional),
 * and the isActive flag is a boolean (optional).
 */
export const UserUpdateSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    role: z.enum(["customer", "admin", "vendor"]).optional(),
    isActive: z.boolean().optional(),
  }),
});

// =========================
// =========================
// PRODUCTS
// =========================
/**
 * ProductCreateSchema: Validates the request body for creating a new product.
 * Ensures that the name is provided, the description and SKU are optional strings,
 * the price is a number, the currency is an optional string, and the stock is an optional integer.
 */
export const ProductCreateSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().nonnegative(),
    currency: z.string().optional(),
    stock: z.number().int().nonnegative().optional(),
  }),
});

/**
 * ProductUpdateSchema: Validates the request body for updating an existing product.
 * Ensures that the name, description, SKU, price, currency, and stock are optional,
 * and the isActive flag is a boolean (optional).
 */
export const ProductUpdateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().nonnegative().optional(),
    currency: z.string().optional(),
    stock: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
});

// =========================
// CARTS
// =========================
/**
 * CartItemCreateSchema: Validates the request body for adding a new item to the cart.
 * Ensures that the productId is a valid UUID and the quantity is a positive integer.
 */

export const CartItemCreateSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  }),
});
/**
 * CartItemUpdateSchema: Validates the request body for updating an existing cart item.
 * Ensures that the quantity is a positive integer.
 */
export const CartItemUpdateSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive(),
  }),
});

// =========================
// ORDERS
// =========================
/**
 * OrderUpdateSchema: Validates the request body for updating an existing order.
 * Ensures that the status is one of 'pending', 'paid', 'shipped', 'completed', or 'cancelled' (optional).
 */

export const OrderUpdateSchema = z.object({
  body: z.object({
    status: z
      .enum(["pending", "paid", "shipped", "completed", "cancelled"])
      .optional(),
  }),
});

// =========================
// PAYMENTS
// =========================
/**
 * PaymentCreateSchema: Validates the request body for creating a new payment.
 * Ensures that the orderId is a valid UUID, the provider is a string, and the dummyToken is a string.
 */

export const PaymentCreateSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    provider: z.string(),
    dummyToken: z.string(),
  }),
});
