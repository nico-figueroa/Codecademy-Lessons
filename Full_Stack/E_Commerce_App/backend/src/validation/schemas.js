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
    name: z.string().trim().min(1).max(255).optional(),
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
 * OAuthCallbackSchema: Validates the query string GitHub redirects back with
 * after the user authorizes (or denies) the app, plus the `provider` route
 * param. `code`/`state` are present on success; `error` is present if the
 * user denied access or GitHub rejected the request.
 */
export const OAuthCallbackSchema = z.object({
  query: z.object({
    code: z.string().min(1).optional(),
    state: z.string().uuid().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  params: z.object({
    provider: z.enum(["github"]),
  }),
});

/**
 * OAuthStartSchema: Validates the request parameters for starting an OAuth flow.
 * Only 'github' is implemented currently; google/microsoft are reserved in
 * the schema for future providers.
 */
export const OAuthStartSchema = z.object({
  params: z.object({
    provider: z.enum(["github"]),
  }),
  query: z.object({ select: z.string().optional() }).optional(),
});

/**
 * OAuthConfirmSchema: Body for confirming (or discarding) a pending GitHub
 * sign-in ticket.
 */
export const OAuthConfirmSchema = z.object({
  body: z.object({
    ticket: z.string().uuid(),
  }),
});

export const OAuthTicketSchema = z.object({
  params: z.object({
    ticket: z.string().uuid(),
  }),
});

// =========================
// ADDRESSES / PROFILE
// =========================
export const AddressFields = {
  name: z.string().trim().min(1).max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  line1: z.string().trim().min(1).max(255),
  line2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().length(2).toUpperCase(),
};

export const AddressSchema = z.object(AddressFields);

/**
 * ProfileUpdateSchema: Validates the signed-in user updating their own
 * profile (display name, phone and default delivery address). All optional.
 */
export const ProfileUpdateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(255).optional(),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    address: AddressSchema.partial().optional(),
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
const UserAddressShape = z.object({
  line1: z.string().max(255).optional(),
  line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2).optional(),
});

export const UserCreateSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["customer", "admin", "vendor"]).optional(),
    name: z.string().max(255).optional(),
    phone: z.string().max(50).optional(),
    address: UserAddressShape.optional(),
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
    password: z.string().min(8).optional(),
    name: z.string().max(255).optional(),
    phone: z.string().max(50).optional(),
    address: UserAddressShape.optional(),
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
    imageUrl: z.string().url().optional(),
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
    imageUrl: z.string().url().optional(),
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

/**
 * OrderCreateSchema: optional delivery address. When omitted the address
 * saved on the user profile is used; if neither exists the order is rejected.
 */
export const OrderCreateSchema = z.object({
  body: z
    .object({
      shippingAddress: AddressSchema.optional(),
    })
    .optional(),
});

export const OrderUpdateSchema = z.object({
  body: z.object({
    status: z
      .enum(["pending", "paid", "shipped", "completed", "cancelled"])
      .optional(),
    userId: z.string().uuid().optional(),
    paymentStatus: z.enum(["unpaid", "paid", "failed"]).optional(),
    shippingAddress: AddressSchema.optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().min(0).max(1000),
        }),
      )
      .min(1)
      .optional(),
  }),
});

export const ShipmentUpdateSchema = z.object({
  body: z.object({
    carrier: z.string().trim().max(100).optional(),
    service: z.string().trim().max(100).optional(),
    trackingNumber: z.string().trim().max(255).optional(),
    trackingUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
    status: z.enum(["pre_transit", "in_transit", "delivered", "failed"]).optional(),
  }),
});

// =========================
// PAYMENTS
// =========================
/**
 * PaymentIntentCreateSchema: Validates the request body for creating a Stripe
 * PaymentIntent for a given order. Stripe handles the actual card data via
 * the Payment Element on the frontend; the API only needs the orderId.
 */
export const PaymentIntentCreateSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
  }),
});
