import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import type { DrizzleDB } from '../db/db.module';
import { collections, products, productImages, variants, collectionProducts } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class CollectionsService {
  constructor(@Inject(DB_CONNECTION) private readonly db: DrizzleDB) {}

  async getCollectionBySlug(slug: string, params: any) {
    try {
      console.log(`[Collections] Fetching collection with slug: ${slug}`);
      const [collection] = await this.db.select().from(collections).where(eq(collections.slug, slug));
      
      if (!collection) {
        console.warn(`[Collections] Collection not found for slug: ${slug}`);
        throw new NotFoundException('Collection not found');
      }

      const { id: collectionId } = collection;
      console.log(`[Collections] Found collection: ${collection.title} (ID: ${collectionId})`);

      // 1. Get all product IDs in collection
      const cpIds = await this.db.select({ productId: collectionProducts.productId })
        .from(collectionProducts)
        .where(eq(collectionProducts.collectionId, collectionId));
      
      if (cpIds.length === 0) {
        console.log(`[Collections] No products found for collection: ${collection.title}`);
        return { items: [], nextCursor: null, total: 0, facets: {} };
      }

      const productIds = cpIds.map(cp => cp?.productId).filter(id => id !== undefined && id !== null);
      
      if (productIds.length === 0) {
        return { items: [], nextCursor: null, total: 0, facets: {} };
      }

      // 2. Fetch those products with images and variants
      const allProducts = await this.db.select().from(products).where(inArray(products.id, productIds));
      const allImages = await this.db.select().from(productImages).where(inArray(productImages.productId, productIds));
      const allVariants = await this.db.select().from(variants).where(inArray(variants.productId, productIds));

      console.log(`[Collections] Fetched ${allProducts.length} products for collection.`);

      // Combine into ProductCard[]
      let items: any[] = allProducts.map(p => {
        const pVars = allVariants.filter(v => v && v.productId === p.id);
        const pImgs = allImages.filter(i => i && i.productId === p.id);
        pImgs.sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0));
        return { ...p, variants: pVars, images: pImgs };
      });

      // 3. Calculate Facets BEFORE filtering
      const facets: any = {
        orientation: [],
        color: [],
        size: [],
        material: [],
        onSale: [],
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
        
        if (p.variants && Array.isArray(p.variants)) {
          const sizes = new Set(p.variants.map((v: any) => v?.size).filter(Boolean));
          sizes.forEach(s => countFacet(facets.size, 'size', s));
          
          const materials = new Set(p.variants.map((v: any) => v?.material).filter(Boolean));
          materials.forEach(m => countFacet(facets.material, 'material', m));
        }
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
        items = items.filter(p => p.variants.some((v: any) => params.size.includes(v.size)));
      }
      if (params.material && params.material.length > 0) {
        items = items.filter(p => p.variants.some((v: any) => params.material.includes(v.material)));
      }

      const total = items.length;

      // 5. Apply sorting
      items.sort((a, b) => {
        if (params.sort === 'popular') {
          return (Number(b.ratingCount) || 0) - (Number(a.ratingCount) || 0);
        } else if (params.sort === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        } else if (params.sort === 'price_asc') {
          const minA = a.variants.length > 0 ? Math.min(...a.variants.map((v: any) => v.priceCents)) : 0;
          const minB = b.variants.length > 0 ? Math.min(...b.variants.map((v: any) => v.priceCents)) : 0;
          return minA - minB;
        } else if (params.sort === 'price_desc') {
          const minA = a.variants.length > 0 ? Math.min(...a.variants.map((v: any) => v.priceCents)) : 0;
          const minB = b.variants.length > 0 ? Math.min(...b.variants.map((v: any) => v.priceCents)) : 0;
          return minB - minA;
        }
        return 0; // Default no sort
      });

      // 6. Pagination
      const limit = params.limit ? parseInt(params.limit, 10) : 40;
      const cursor = params.cursor ? parseInt(params.cursor, 10) : 0;
      const pagedItems = items.slice(cursor, cursor + limit);
      
      const nextCursor = (cursor + limit < items.length) ? String(cursor + limit) : null;

      return { items: pagedItems, nextCursor, total, facets };
    } catch (error) {
      console.error(`[Collections Error] Failed to fetch collection:`, error);
      throw error;
    }
  }
}
