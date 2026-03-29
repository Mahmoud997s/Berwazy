import { pgTable, text, serial, integer, boolean, timestamp, numeric, primaryKey } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  googleId: text("google_id").unique(),
  role: text("role").default("user"),  // "user" | "admin"
  isActive: boolean("is_active").default(true),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  totalAmount: integer("total_amount").notNull(), // in cents
  shippingAddress: text("shipping_address").notNull(), // storing as JSON string or text for simplicity
  trackingNumber: text("tracking_number"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: integer("price_at_purchase").notNull(), // in cents
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sort: integer("sort").default(0),
  isActive: boolean("is_active").default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  schemaJson: text("schema_json"),
  robots: text("robots"),
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
  tags: text("tags").array().default(sql`'{}'::text[]`),
  views: integer("views").default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  schemaJson: text("schema_json"),
  robots: text("robots"),
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

export const relatedProducts = pgTable("related_products", {
  productId: integer("product_id").notNull(),
  relatedProductId: integer("related_product_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.productId, t.relatedProductId] }),
}));

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  variantId: integer("variant_id").notNull(),
  qty: integer("qty").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title"),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  linkText: text("link_text"),
  secondaryLinkUrl: text("secondary_link_url"),
  secondaryLinkText: text("secondary_link_text"),
  sort: integer("sort").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shippingRates = pgTable("shipping_rates", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  priceCents: integer("price_cents").notNull(),
  estimatedDays: text("estimated_days"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // 'percentage', 'fixed'
  discountValue: integer("discount_value").notNull(),
  minOrderAmount: integer("min_order_amount").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const redirects = pgTable("redirects", {
  id: serial("id").primaryKey(),
  source: text("source").notNull().unique(),
  destination: text("destination").notNull(),
  permanent: boolean("permanent").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaFolders = pgTable("media_folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  folderId: integer("folder_id"),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'registration', 'order_confirmation', etc.
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("image_url"),
  authorId: integer("author_id").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  carts: many(carts),
  wishlistItems: many(wishlists),
  orders: many(orders),
  blogPosts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(variants, {
    fields: [orderItems.variantId],
    references: [variants.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  variants: many(variants),
  collections: many(collectionProducts),
  wishlistItems: many(wishlists),
  relatedProducts: many(relatedProducts, { relationName: "productToRelated" }),
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

export const mediaFoldersRelations = relations(mediaFolders, ({ one, many }) => ({
  parent: one(mediaFolders, {
    fields: [mediaFolders.parentId],
    references: [mediaFolders.id],
    relationName: "folderToParent",
  }),
  children: many(mediaFolders, { relationName: "folderToParent" }),
  media: many(media),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  folder: one(mediaFolders, {
    fields: [media.folderId],
    references: [mediaFolders.id],
  }),
}));

export const relatedProductsRelations = relations(relatedProducts, ({ one }) => ({
  product: one(products, {
    fields: [relatedProducts.productId],
    references: [products.id],
    relationName: "productToRelated",
  }),
  relatedProduct: one(products, {
    fields: [relatedProducts.relatedProductId],
    references: [products.id],
    relationName: "relatedToProduct",
  }),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
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

export const insertCartItemSchema = z.object({ 
  cartId: z.number(), 
  variantId: z.number(), 
  qty: z.number(), 
  unitPriceCents: z.number() 
});

export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export const Banner = typeof banners.$inferSelect;
export type RelatedProduct = typeof relatedProducts.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type StoreSetting = typeof storeSettings.$inferSelect;
export type Redirect = typeof redirects.$inferSelect;
export type MediaFolder = typeof mediaFolders.$inferSelect;
export type Media = typeof media.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;

export type OrderItemResponse = OrderItem & {
  product: Product & { images?: ProductImage[] };
  variant: Variant;
};

export type OrderResponse = Order & {
  user: User;
  items: OrderItemResponse[];
};

export type ProductCard = Product & {
  images: ProductImage[];
  variants: Variant[];
};

export type CartItemResponse = CartItem & {
  variant: Variant & { product: Product & { images?: ProductImage[] } };
};

export type CartResponse = Cart & {
  items: CartItemResponse[];
};
