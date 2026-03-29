import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const allProducts = await db.select().from(schema.products);
  const allVariants = await db.select().from(schema.variants);
  const allImages = await db.select().from(schema.productImages);

  console.log(`--- Migration Statistics ---`);
  console.log(`Total Products: ${allProducts.length}`);
  console.log(`Total Variants: ${allVariants.length}`);
  console.log(`Total Images:   ${allImages.length}`);
  
  if (allProducts.length > 0) {
    console.log(`\nSample Product: ${allProducts[0].title} (${allProducts[0].slug})`);
  }

  process.exit(0);
}

main().catch(console.error);
