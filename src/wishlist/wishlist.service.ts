import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION, type DrizzleDB } from '../db/db.module';
import { wishlists, products } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class WishlistService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db: DrizzleDB,
  ) {}

  async getWishlist(userId: number) {
    const results = await (this.db as any).query.wishlists.findMany({
      where: eq(wishlists.userId, userId),
      with: {
        product: {
          with: {
            images: true,
            variants: true,
          }
        }
      }
    });

    return results.map((item: any) => item.product);
  }

  async addToWishlist(userId: number, productId: number) {
    // Check if already in wishlist
    const [existing] = await (this.db as any)
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productId)
        )
      );

    if (existing) {
      return { message: 'Already in wishlist' };
    }

    // Check if product exists
    const [product] = await (this.db as any)
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await (this.db as any)
      .insert(wishlists)
      .values({
        userId,
        productId,
      } as any);

    return { message: 'Added to wishlist' };
  }

  async removeFromWishlist(userId: number, productId: number) {
    await (this.db as any)
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productId)
        )
      );

    return { message: 'Removed from wishlist' };
  }

  async toggleWishlist(userId: number, productId: number) {
    const [existing] = await (this.db as any)
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productId)
        )
      );

    if (existing) {
      await this.removeFromWishlist(userId, productId);
      return { added: false };
    } else {
      await this.addToWishlist(userId, productId);
      return { added: true };
    }
  }

  async isInWishlist(userId: number, productId: number) {
    const [existing] = await (this.db as any)
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productId)
        )
      );

    return !!existing;
  }
}
