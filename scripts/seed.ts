import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding database...");

  // 1. Create Collections
  const collectionData = [
    { slug: "football-posters", title: "Football Posters", description: "Premium football wall art." },
    { slug: "abstract", title: "Abstract Art", description: "Modern abstract prints." },
    { slug: "vintage", title: "Vintage Collection", description: "Classic and timeless designs." },
  ];

  for (const c of collectionData) {
    await db.insert(schema.collections).values(c).onConflictDoNothing();
  }

  const [footballCol] = await db.select().from(schema.collections).where(eq(schema.collections.slug, "football-posters"));
  const [abstractCol] = await db.select().from(schema.collections).where(eq(schema.collections.slug, "abstract"));
  const [vintageCol] = await db.select().from(schema.collections).where(eq(schema.collections.slug, "vintage"));

  // 2. Create Products
  const productsData = [
    {
      slug: "stadium-lights-poster",
      title: "Stadium Lights",
      description: "Capture the magic of a night match with this stunning stadium atmosphere print.",
      orientation: "portrait",
      color: "blue",
      ratingAvg: "4.9",
      ratingCount: 124,
      isSale: true,
      salePct: 20,
    },
    {
      slug: "golden-goal-abstract",
      title: "Golden Goal",
      description: "An abstract representation of the moment of victory.",
      orientation: "square",
      color: "gold",
      ratingAvg: "4.8",
      ratingCount: 89,
    },
    {
      slug: "classic-leather-ball",
      title: "Classic Leather Ball",
      description: "A tribute to the roots of the game. Vintage style leather ball on grass.",
      orientation: "portrait",
      color: "brown",
      ratingAvg: "5.0",
      ratingCount: 56,
    },
    {
      slug: "football-hero-silhouette",
      title: "The Hero's Path",
      description: "Dynamic silhouette of a player mid-action. Minimalist and powerful.",
      orientation: "portrait",
      color: "black",
      ratingAvg: "4.7",
      ratingCount: 210,
    }
  ];

  for (const p of productsData) {
    const [inserted] = await (db.insert(schema.products).values(p as any).onConflictDoNothing().returning() as any);
    if (!inserted) continue;

    const productId = inserted.id;

    // Add Images
    const images = {
      "stadium-lights-poster": "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800",
      "golden-goal-abstract": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800",
      "classic-leather-ball": "https://images.unsplash.com/photo-1552068751-34cb5cf055b3?q=80&w=800",
      "football-hero-silhouette": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800"
    };

    await db.insert(schema.productImages).values({
      productId,
      url: images[p.slug as keyof typeof images],
      alt: p.title,
      sort: 0
    });

    // Add Variants
    const sizes = ["30x40cm", "50x70cm", "70x100cm"];
    const basePrice = 2900; // $29.00

    for (const [idx, size] of sizes.entries()) {
      await db.insert(schema.variants).values({
        productId,
        material: "Premium Paper",
        size,
        priceCents: basePrice + (idx * 1500),
        sku: `${p.slug}-${size.toLowerCase()}`,
        inStock: true
      });
    }

    // Link to Football Collection
    await db.insert(schema.collectionProducts).values({
      collectionId: footballCol.id,
      productId
    });
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
