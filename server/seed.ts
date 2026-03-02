import { db } from "./db";
import { collections, products, productImages, variants, collectionProducts } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if already seeded
  const existingCollections = await db.select().from(collections);
  if (existingCollections.length > 0) {
    console.log("Database already seeded");
    return;
  }

  // Create Collection
  const [collection] = await db.insert(collections).values({
    slug: "football-posters",
    title: "Football Posters",
    description: "Premium quality football posters for your home or office.",
  }).returning();

  const orientations = ["portrait", "landscape"];
  const colors = ["red", "blue", "black", "white", "multi"];
  const materials = ["POSTER", "CANVAS"];
  const sizes = ["21x30", "30x42", "50x70", "70x100"];

  console.log("Generating 80 products...");
  
  for (let i = 1; i <= 80; i++) {
    const isSale = Math.random() > 0.7; // 30% chance of being on sale
    const [product] = await db.insert(products).values({
      slug: `football-poster-${i}`,
      title: `Classic Football Poster ${i}`,
      description: `A beautiful representation of the beautiful game. Perfect for any fan. Edition ${i}.`,
      orientation: orientations[Math.floor(Math.random() * orientations.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      ratingAvg: (Math.random() * 2 + 3).toFixed(2), // 3.0 to 5.0
      ratingCount: Math.floor(Math.random() * 200),
      isSale,
      salePct: isSale ? Math.floor(Math.random() * 20) + 10 : 0, // 10% to 30% off
    }).returning();

    await db.insert(collectionProducts).values({
      collectionId: collection.id,
      productId: product.id,
    });

    // Add images
    const numImages = Math.floor(Math.random() * 3) + 2; // 2 to 4 images
    for (let j = 0; j < numImages; j++) {
      await db.insert(productImages).values({
        productId: product.id,
        url: `https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&auto=format&fit=crop&sig=${i*10+j}`, // placeholder football image
        alt: `Football Poster ${i} view ${j + 1}`,
        sort: j,
      });
    }

    // Add variants (always provide POSTER and CANVAS with a couple of sizes)
    for (const material of materials) {
      // randomly pick 2 sizes for this material
      const shuffledSizes = [...sizes].sort(() => 0.5 - Math.random());
      const selectedSizes = shuffledSizes.slice(0, 2);
      
      for (const size of selectedSizes) {
        let basePrice = size === "21x30" ? 1900 : size === "30x42" ? 2900 : size === "50x70" ? 4900 : 6900;
        if (material === "CANVAS") basePrice += 2000;
        
        if (isSale) {
           basePrice = Math.floor(basePrice * (1 - (product.salePct! / 100)));
        }

        await db.insert(variants).values({
          productId: product.id,
          material,
          size,
          priceCents: basePrice,
          sku: `SKU-${i}-${material}-${size}`,
          inStock: Math.random() > 0.1, // 90% chance in stock
        });
      }
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
