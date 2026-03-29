import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import https from 'https';

const SOURCE_URL = "https://artsyfartsy.de/en/collections/football-posters-1/products.json?limit=250";
const TARGET_COLLECTION_SLUG = "football-posters";
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'products');

async function downloadImage(url: string, filename: string): Promise<string> {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(`/uploads/products/${filename}`);
      });
    }).on('error', reject);
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Fetching products from Source...");
  const response = await fetch(SOURCE_URL);
  const data = await response.json();
  const shopifyProducts = data.products;

  console.log(`Found ${shopifyProducts.length} products. Starting migration...`);

  // 1. Ensure "Football Posters" collection exists
  let [footballCol] = await db.select().from(schema.collections).where(eq(schema.collections.slug, TARGET_COLLECTION_SLUG));
  if (!footballCol) {
    [footballCol] = await db.insert(schema.collections).values({
      slug: TARGET_COLLECTION_SLUG,
      title: "Football Posters",
      description: "Premium football wall art from BRAWEZZ.",
    }).returning();
  }

  // 2. Clear existing products
  console.log("Clearing existing products and related data...");
  await db.delete(schema.collectionProducts);
  await db.delete(schema.variants);
  await db.delete(schema.productImages);
  await db.delete(schema.relatedProducts);
  await db.delete(schema.products);

  for (const sp of shopifyProducts) {
    console.log(`Migrating: ${sp.title}...`);

    const productSlug = sp.handle;
    
    // Insert Product
    const [insertedProduct] = await db.insert(schema.products).values({
      slug: productSlug,
      title: sp.title,
      description: sp.body_html,
      orientation: "portrait", // Most posters seem to be portrait
      color: "various",
      tags: sp.tags,
      isSale: sp.variants.some((v: any) => v.compare_at_price && parseFloat(v.compare_at_price) > parseFloat(v.price)),
    }).returning();

    const productId = insertedProduct.id;

    // Add Images
    for (const [idx, img] of sp.images.entries()) {
      const ext = path.extname(new URL(img.src).pathname) || '.jpg';
      const filename = `${productSlug}-${idx}${ext}`;
      try {
        const localUrl = await downloadImage(img.src, filename);
        await db.insert(schema.productImages).values({
          productId,
          url: localUrl,
          alt: sp.title,
          sort: idx
        });
      } catch (err) {
        console.error(`Failed to download image for ${sp.title}:`, err);
      }
    }

    // Add Variants
    for (const v of sp.variants) {
      await db.insert(schema.variants).values({
        productId,
        material: v.option1 || "Poster",
        size: v.option2 || "Default",
        priceCents: Math.round(parseFloat(v.price) * 100),
        sku: v.sku || `${productSlug}-${v.id}`,
        inStock: v.available
      });
    }

    // Link to Collection
    await db.insert(schema.collectionProducts).values({
      collectionId: footballCol.id,
      productId
    });
  }

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
