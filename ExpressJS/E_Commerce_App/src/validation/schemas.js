import { z } from 'zod';

// =========================
// AUTH
// =========================

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

// =========================
// USERS
// =========================

export const UserCreateSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['customer', 'admin', 'vendor']).optional(),
  }),
});

export const UserUpdateSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    role: z.enum(['customer', 'admin', 'vendor']).optional(),
    isActive: z.boolean().optional(),
  }),
});

// =========================
// PRODUCTS
// =========================

export const ProductCreateSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number(),
    currency: z.string().optional(),
    stock: z.number().int().optional(),
  }),
});

export const ProductUpdateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    stock: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

// =========================
// CARTS
// =========================

export const CartItemCreateSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  }),
});

export const CartItemUpdateSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive(),
  }),
});

// =========================
// ORDERS
// =========================

export const OrderUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled']).optional(),
  }),
});

// =========================
// PAYMENTS
// =========================

export const PaymentCreateSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    provider: z.string(),
    dummyToken: z.string(),
  }),
});
