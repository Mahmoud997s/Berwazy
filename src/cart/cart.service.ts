import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import type { DrizzleDB } from '../db/db.module';
import { carts, cartItems, variants, products, productImages } from '@shared/schema';
import type { CartResponse } from '@shared/schema';
import { eq, inArray, and, asc } from 'drizzle-orm';

@Injectable()
export class CartService {
  constructor(@Inject(DB_CONNECTION) private readonly db: DrizzleDB) {}

  private async getOrCreateCartObj(sessionId: string) {
    let [cart] = await this.db.select().from(carts).where(eq(carts.sessionId, sessionId));
    if (!cart) {
      [cart] = await this.db.insert(carts).values({ sessionId }).returning();
    }
    return cart;
  }

  async getCart(sessionId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCartObj(sessionId);
    
    const items = await this.db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
    if (items.length === 0) return { ...cart, items: [] };

    const variantIds = items.map(i => i.variantId);
    const vars = await this.db.select().from(variants).where(inArray(variants.id, variantIds));
    const productIds = Array.from(new Set(vars.map(v => v.productId)));
    
    const prods = await this.db.select().from(products).where(inArray(products.id, productIds));
    const images = await this.db.select().from(productImages).where(inArray(productImages.productId, productIds));

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
    
    const [v] = await this.db.select().from(variants).where(eq(variants.id, variantId));
    if (!v) throw new NotFoundException('Variant not found');

    const [existing] = await this.db.select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)));
      
    if (existing) {
      await this.db.update(cartItems)
        .set({ qty: existing.qty + qty } as any)
        .where(eq(cartItems.id, existing.id));
    } else {
      await this.db.insert(cartItems).values({
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
    const [existing] = await this.db.select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, itemId)));
    
    if (existing) {
      await this.db.update(cartItems).set({ qty } as any).where(eq(cartItems.id, itemId));
    }
    
    return this.getCart(sessionId);
  }

  async deleteCartItem(sessionId: string, itemId: number): Promise<CartResponse> {
    const cart = await this.getOrCreateCartObj(sessionId);
    await this.db.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.id, itemId)));
    return this.getCart(sessionId);
  }
}
