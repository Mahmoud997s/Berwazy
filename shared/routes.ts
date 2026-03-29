import { z } from 'zod';
import type { ProductCard, CartResponse, Product, ProductImage, Variant } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  collections: {
    get: {
      method: 'GET' as const,
      path: '/api/v1/collections/:slug' as const,
      input: z.object({
        cursor: z.string().optional(),
        limit: z.coerce.number().optional(),
        sort: z.string().optional(),
        orientation: z.string().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
        material: z.string().optional(),
        onSale: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          items: z.array(z.any()), // Represents ProductCard[]
          nextCursor: z.string().nullable(),
          total: z.number(),
          facets: z.object({
            orientation: z.array(z.object({ value: z.string(), count: z.number() })),
            color: z.array(z.object({ value: z.string(), count: z.number() })),
            size: z.array(z.object({ value: z.string(), count: z.number() })),
            material: z.array(z.object({ value: z.string(), count: z.number() })),
            onSale: z.array(z.object({ value: z.string(), count: z.number() })),
          })
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  products: {
    get: {
      method: 'GET' as const,
      path: '/api/v1/products/:slug' as const,
      responses: {
        200: z.object({
          product: z.any(),
          images: z.array(z.any()),
          variants: z.array(z.any()),
          priceRange: z.object({ minCents: z.number(), maxCents: z.number() })
        }),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/v1/products' as const,
      input: z.object({
        search: z.string().optional(),
        sort: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.object({
          items: z.array(z.any()), // ProductCard[]
          nextCursor: z.string().nullable(),
          total: z.number(),
        }),
      },
    }
  },
  cart: {
    get: {
      method: 'GET' as const,
      path: '/api/v1/cart' as const,
      responses: {
        200: z.any(), // Represents CartResponse
      },
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/v1/cart/items' as const,
      input: z.object({
        variantId: z.number(),
        qty: z.number().min(1),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/v1/cart/items/:id' as const,
      input: z.object({
        qty: z.number().min(1),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    deleteItem: {
      method: 'DELETE' as const,
      path: '/api/v1/cart/items/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/v1/auth/register' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      }),
    },
    login: {
      method: 'POST' as const,
      path: '/api/v1/auth/login' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    },
    logout: {
      method: 'GET' as const,
      path: '/api/v1/auth/logout' as const,
    },
    me: {
      method: 'GET' as const,
      path: '/api/v1/auth/me' as const,
    },
    google: {
      method: 'GET' as const,
      path: '/api/v1/auth/google' as const,
    },
    updateProfile: {
      method: 'POST' as const,
      path: '/api/v1/auth/profile' as const,
    },
    updatePassword: {
      method: 'POST' as const,
      path: '/api/v1/auth/password' as const,
    },
    uploadAvatar: { path: "/api/v1/auth/avatar", method: "POST" as const },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
