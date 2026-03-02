import { pgTable, text, serial, integer, boolean, timestamp, numeric, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  orientation: text("orientation").notNull(),
  color: text("color").notNull(),
  ratingAvg: numeric("rating_avg", { precision: 3, scale: 2 }).default('0'),
  ratingCount: integer("rating_count").default(0),
  isSale: boolean("is_sale").default(false),
  salePct: integer("sale_pct").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  sort: integer("sort").default(0),
});

export const variants = pgTable("variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  material: text("material").notNull(),
  size: text("size").notNull(),
  priceCents: integer("price_cents").notNull(),
  sku: text("sku").notNull().unique(),
  inStock: boolean("in_stock").default(true),
});

export const collectionProducts = pgTable("collection_products", {
  collectionId: integer("collection_id").notNull(),
  productId: integer("product_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.collectionId, t.productId] }),
}));

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  variantId: integer("variant_id").notNull(),
  qty: integer("qty").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  variants: many(variants),
  collections: many(collectionProducts),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(collectionProducts),
}));

export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionProducts.collectionId],
    references: [collections.id],
  }),
  product: one(products, {
    fields: [collectionProducts.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  variant: one(variants, {
    fields: [cartItems.variantId],
    references: [variants.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;

export type ProductCard = Product & {
  images: ProductImage[];
  variants: Variant[];
};

export type CartItemResponse = CartItem & {
  variant: Variant & { product: Product };
};

export type CartResponse = Cart & {
  items: CartItemResponse[];
};
