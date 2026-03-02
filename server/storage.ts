import { db } from "./db";
import {
  collections,
  products,
  productImages,
  variants,
  collectionProducts,
  carts,
  cartItems,
  type Collection,
  type ProductCard,
  type CartResponse,
  type Cart,
  type CartItem,
} from "@shared/schema";
import { eq, inArray, and, gte, lte, sql, desc, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getCollectionBySlug(slug: string): Promise<Collection | undefined>;
  getProductsByCollection(
    collectionId: number,
    params: {
      cursor?: string;
      limit?: number;
      sort?: string;
      orientation?: string[];
      color?: string[];
      size?: string[];
      material?: string[];
      onSale?: string[];
    }
  ): Promise<{
    items: ProductCard[];
    nextCursor: string | null;
    total: number;
    facets: any;
  }>;
  getProductBySlug(slug: string): Promise<{
    product: any;
    images: any[];
    variants: any[];
    priceRange: { minCents: number; maxCents: number };
  } | undefined>;
  
  getCart(sessionId: string): Promise<CartResponse>;
  addCartItem(sessionId: string, variantId: number, qty: number): Promise<CartResponse>;
  updateCartItem(sessionId: string, itemId: number, qty: number): Promise<CartResponse>;
  deleteCartItem(sessionId: string, itemId: number): Promise<CartResponse>;
}

export class DatabaseStorage implements IStorage {
  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.slug, slug));
    return collection;
  }

  async getProductsByCollection(collectionId: number, params: any): Promise<any> {
    // 1. Get all product IDs in collection
    const cpIds = await db.select({ productId: collectionProducts.productId })
      .from(collectionProducts)
      .where(eq(collectionProducts.collectionId, collectionId));
    
    if (cpIds.length === 0) {
      return { items: [], nextCursor: null, total: 0, facets: {} };
    }

    const productIds = cpIds.map(cp => cp.productId);

    // 2. Fetch those products with images and variants
    const allProducts = await db.select().from(products).where(inArray(products.id, productIds));
    const allImages = await db.select().from(productImages).where(inArray(productImages.productId, productIds));
    const allVariants = await db.select().from(variants).where(inArray(variants.productId, productIds));

    // Combine into ProductCard[]
    let items: ProductCard[] = allProducts.map(p => {
      const pVars = allVariants.filter(v => v.productId === p.id);
      const pImgs = allImages.filter(i => i.productId === p.id).sort((a, b) => (a.sort || 0) - (b.sort || 0));
      return { ...p, variants: pVars, images: pImgs };
    });

    // 3. Calculate Facets BEFORE filtering
    const facets = {
      orientation: [] as any[],
      color: [] as any[],
      size: [] as any[],
      material: [] as any[],
      onSale: [] as any[],
    };

    const countFacet = (list: any[], key: string, val: any) => {
      let existing = list.find(f => f.value === String(val));
      if (!existing) {
        existing = { value: String(val), count: 0 };
        list.push(existing);
      }
      existing.count++;
    };

    items.forEach(p => {
      countFacet(facets.orientation, 'orientation', p.orientation);
      countFacet(facets.color, 'color', p.color);
      countFacet(facets.onSale, 'onSale', p.isSale ? 'true' : 'false');
      
      const sizes = new Set(p.variants.map(v => v.size));
      sizes.forEach(s => countFacet(facets.size, 'size', s));
      
      const materials = new Set(p.variants.map(v => v.material));
      materials.forEach(m => countFacet(facets.material, 'material', m));
    });

    // 4. Apply filters
    if (params.orientation && params.orientation.length > 0) {
      items = items.filter(p => params.orientation.includes(p.orientation));
    }
    if (params.color && params.color.length > 0) {
      items = items.filter(p => params.color.includes(p.color));
    }
    if (params.onSale && params.onSale.length > 0) {
      const wantSale = params.onSale.includes('true');
      const wantNotSale = params.onSale.includes('false');
      if (wantSale && !wantNotSale) items = items.filter(p => p.isSale);
      if (!wantSale && wantNotSale) items = items.filter(p => !p.isSale);
    }
    if (params.size && params.size.length > 0) {
      items = items.filter(p => p.variants.some(v => params.size.includes(v.size)));
    }
    if (params.material && params.material.length > 0) {
      items = items.filter(p => p.variants.some(v => params.material.includes(v.material)));
    }

    const total = items.length;

    // 5. Apply sorting
    items.sort((a, b) => {
      if (params.sort === 'popular') {
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      } else if (params.sort === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      } else if (params.sort === 'price_asc') {
        const minA = Math.min(...a.variants.map(v => v.priceCents));
        const minB = Math.min(...b.variants.map(v => v.priceCents));
        return minA - minB;
      } else if (params.sort === 'price_desc') {
        const minA = Math.min(...a.variants.map(v => v.priceCents));
        const minB = Math.min(...b.variants.map(v => v.priceCents));
        return minB - minA;
      }
      return 0; // Default no sort
    });

    // 6. Pagination (simple array slice since we did it in memory)
    const limit = params.limit || 40;
    const cursor = params.cursor ? parseInt(params.cursor, 10) : 0;
    const pagedItems = items.slice(cursor, cursor + limit);
    
    const nextCursor = (cursor + limit < items.length) ? String(cursor + limit) : null;

    return { items: pagedItems, nextCursor, total, facets };
  }

  async getProductBySlug(slug: string): Promise<any> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    if (!product) return undefined;

    const images = await db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sort));
    const vars = await db.select().from(variants).where(eq(variants.productId, product.id));

    const minCents = vars.length > 0 ? Math.min(...vars.map(v => v.priceCents)) : 0;
    const maxCents = vars.length > 0 ? Math.max(...vars.map(v => v.priceCents)) : 0;

    return { product, images, variants: vars, priceRange: { minCents, maxCents } };
  }

  private async getOrCreateCartObj(sessionId: string) {
    let [cart] = await db.select().from(carts).where(eq(carts.sessionId, sessionId));
    if (!cart) {
      [cart] = await db.insert(carts).values({ sessionId }).returning();
    }
    return cart;
  }

  async getCart(sessionId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCartObj(sessionId);
    
    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
    if (items.length === 0) return { ...cart, items: [] };

    const variantIds = items.map(i => i.variantId);
    const vars = await db.select().from(variants).where(inArray(variants.id, variantIds));
    const productIds = Array.from(new Set(vars.map(v => v.productId)));
    
    const prods = await db.select().from(products).where(inArray(products.id, productIds));
    const images = await db.select().from(productImages).where(inArray(productImages.productId, productIds));

    const fullItems = items.map(item => {
      const v = vars.find(x => x.id === item.variantId)!;
      const p = prods.find(x => x.id === v.productId)!;
      const imgs = images.filter(x => x.productId === p.id).sort((a,b) => (a.sort || 0) - (b.sort || 0));
      return {
        ...item,
        variant: { ...v, product: { ...p, images: imgs } }
      };
    });

    return { ...cart, items: fullItems };
  }

  async addCartItem(sessionId: string, variantId: number, qty: number): Promise<CartResponse> {
    const cart = await this.getOrCreateCartObj(sessionId);
    
    const [v] = await db.select().from(variants).where(eq(variants.id, variantId));
    if (!v) throw new Error("Variant not found");

    // Check if exists
    const [existing] = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)));
    if (existing) {
      await db.update(cartItems)
        .set({ qty: existing.qty + qty })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        variantId,
        qty,
        unitPriceCents: v.priceCents
      });
    }

    return this.getCart(sessionId);
  }

  async updateCartItem(sessionId: string, itemId: number, qty: number): Promise<CartResponse> {
    const cart = await this.getOrCreateCartObj(sessionId);
    const [existing] = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, itemId)));
    
    if (existing) {
      await db.update(cartItems).set({ qty }).where(eq(cartItems.id, itemId));
    }
    
    return this.getCart(sessionId);
  }

  async deleteCartItem(sessionId: string, itemId: number): Promise<CartResponse> {
    const cart = await this.getOrCreateCartObj(sessionId);
    await db.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, itemId)));
    return this.getCart(sessionId);
  }
}

export const storage = new DatabaseStorage();
