import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import type { DrizzleDB } from '../db/db.module';
import { products, productImages, variants, collectionProducts } from '@shared/schema';
import { eq, asc, desc, ilike, or, sql, inArray } from 'drizzle-orm';

@Injectable()
export class ProductsService {
  constructor(@Inject(DB_CONNECTION) private readonly db: DrizzleDB) {}

  async getProducts(params: {
    search?: string;
    sort?: string;
    cursor?: string;
    limit?: number;
    collectionId?: number;
  }) {
    const limit = params.limit || 20;
    const cursor = params.cursor ? parseInt(params.cursor, 10) : 0;

    // 1. Build Query
    let query = this.db.select().from(products);

    // Filters
    const filters = [];
    if (params.search) {
      const q = `%${params.search}%`;
      filters.push(or(ilike(products.title, q), ilike(products.slug, q)));
    }
    
    if (params.collectionId) {
      const cpSubquery = this.db.select({ productId: collectionProducts.productId })
        .from(collectionProducts)
        .where(eq(collectionProducts.collectionId, params.collectionId));
      filters.push(inArray(products.id, cpSubquery));
    }

    if (filters.length > 0) {
      // @ts-ignore - drizzle-orm type complexities
      query = query.where(sql`${sql.join(filters, sql` AND `)}`);
    }

    // Sorting
    if (params.sort === 'newest') {
      query.orderBy(desc(products.createdAt));
    } else if (params.sort === 'popular') {
      query.orderBy(desc(products.views));
    } else {
      query.orderBy(asc(products.id));
    }

    // Total Count
    const [countResult] = await this.db.select({ count: sql<number>`count(*)::int` }).from(query.as('subquery'));

    // Pagination
    const results = await query.limit(limit).offset(cursor);

    // 2. Fetch Relations for results
    const items = await Promise.all(results.map(async (p) => {
      const images = await this.db.select().from(productImages)
        .where(eq(productImages.productId, p.id))
        .orderBy(asc(productImages.sort));
      
      const productVariants = await this.db.select().from(variants)
        .where(eq(variants.productId, p.id));
      
      return { ...p, images, variants: productVariants };
    }));

    const nextCursor = (cursor + limit < countResult.count) ? String(cursor + limit) : null;

    return { items, nextCursor, total: countResult.count };
  }

  async getProductBySlug(slug: string) {
    const [product] = await this.db.select().from(products).where(eq(products.slug, slug));
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const images = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sort));

    const productVariants = await this.db
      .select()
      .from(variants)
      .where(eq(variants.productId, product.id));

    const minCents = productVariants.length > 0 ? Math.min(...productVariants.map(v => v.priceCents)) : 0;
    const maxCents = productVariants.length > 0 ? Math.max(...productVariants.map(v => v.priceCents)) : 0;

    return { product, images, variants: productVariants, priceRange: { minCents, maxCents } };
  }
}
