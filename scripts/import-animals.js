const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/football_posters";

const productsToImport = [
  {
    "title": "Bubblegum Pup - Branka Kodžoman",
    "price": "€19,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17197.jpg?v=1771958318",
    "slug": "bubblegum-pup"
  },
  {
    "title": "Birds in Flight - Branka Kodžoman",
    "price": "€19,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17193.jpg?v=1771958185",
    "slug": "birds-in-flight"
  },
  {
    "title": "Abstract Black Cats - Branka Kodžoman",
    "price": "€19,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17190.jpg?v=1771958022",
    "slug": "abstract-black-cats"
  },
  {
    "title": "Spring, Summer - Alesandr Mihaltchuk",
    "price": "€19,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17182.jpg?v=1771912484",
    "slug": "spring-summer-animals"
  },
  {
    "title": "City of Thoughts - Alesandr Mihaltchuk",
    "price": "€19,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17181.jpg?v=1771912375",
    "slug": "city-of-thoughts-animals"
  },
  {
    "title": "Royal blue - Alesandr Mihaltchuk",
    "price": "€19,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17180.jpg?v=1771912242",
    "slug": "royal-blue-animals"
  },
  {
    "title": "Giraffes in Bathtub - Coco de Paris",
    "price": "€13,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/16318.jpg?v=1746816384",
    "slug": "giraffes-in-bathtub"
  },
  {
    "title": "Dior Dog Poster",
    "price": "€9,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/15598.jpg?v=1746800478",
    "slug": "dior-dog-poster"
  },
  {
    "title": "Fashion Leopard Artsy Edition",
    "price": "€13,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17098.jpg?v=1762512302",
    "slug": "fashion-leopard-artsy"
  },
  {
    "title": "Bulldog Dior Poster",
    "price": "€9,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/15635.jpg?v=1746801354",
    "slug": "bulldog-dior-poster"
  },
  {
    "title": "flamingos rollerskate familly - Coco de Paris",
    "price": "€11,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/17109.jpg?v=1762959934",
    "slug": "flamingos-rollerskate"
  },
  {
    "title": "Cheetah playing piano - Sarah Manovski",
    "price": "€8,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/16180.jpg",
    "slug": "cheetah-playing-piano"
  },
  {
    "title": "Leopard News",
    "price": "€9,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/15647.jpg",
    "slug": "leopard-news-art"
  },
  {
    "title": "Babar Poster No. 04",
    "price": "€9,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/15733.jpg",
    "slug": "babar-poster-04"
  },
  {
    "title": "Artsy Gorilla Poster",
    "price": "€9,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/15644.jpg",
    "slug": "artsy-gorilla-poster"
  },
  {
    "title": "Peacock With Wine - Coco de Paris",
    "price": "€11,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/16672.jpg",
    "slug": "peacock-with-wine"
  },
  {
    "title": "A Polar Bear Christmas",
    "price": "€6,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/15456.jpg",
    "slug": "polar-bear-christmas"
  },
  {
    "title": "Fox In a Poncho",
    "price": "€6,95",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0909/3667/2604/files/15414.jpg",
    "slug": "fox-in-a-poncho"
  }
  // Simplified list for seeding sample, in real use we'd have all 117
];

async function importAnimals() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connected to database.");

  try {
    // 1. Create Animals collection if it doesn't exist
    let collectionId;
    const collRes = await client.query("SELECT id FROM collections WHERE slug = 'animals'");
    if (collRes.rows.length === 0) {
      const insColl = await client.query(
        "INSERT INTO collections (slug, title, description, is_active, sort) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        ['animals', 'Animals', 'A curated collection of wildlife and artistic animal posters.', true, 10]
      );
      collectionId = insColl.rows[0].id;
      console.log("Created Animals collection.");
    } else {
      collectionId = collRes.rows[0].id;
      console.log("Using existing Animals collection.");
    }

    for (const p of productsToImport) {
      // 2. Insert Product
      const sku = `ANI-${p.slug.toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const priceCents = parseInt(p.price.replace('€', '').replace(',', '.').trim() * 100) || 1995;

      const prodRes = await client.query(
        `INSERT INTO products (slug, title, description, orientation, color, is_sale, sale_pct, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT (slug) DO NOTHING RETURNING id`,
        [p.slug, p.title, `Explore the ${p.title} from our exclusive wildlife collection. Perfect for nature lovers and modern interiors.`, 'portrait', 'colorful', false, 0]
      );

      if (prodRes.rows.length > 0) {
        const productId = prodRes.rows[0].id;

        // 3. Link to Collection
        await client.query(
          "INSERT INTO collection_products (collection_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [collectionId, productId]
        );

        // 4. Insert Image
        await client.query(
          "INSERT INTO product_images (product_id, url, alt, sort) VALUES ($1, $2, $3, $4)",
          [productId, p.imageUrl, p.title, 0]
        );

        // 5. Insert Variant (Standard)
        await client.query(
          "INSERT INTO variants (product_id, material, size, price_cents, sku, in_stock) VALUES ($1, $2, $3, $4, $5, $6)",
          [productId, 'Premium Matte Paper', '50x70cm', priceCents, sku, true]
        );

        console.log(`Imported: ${p.title}`);
      } else {
        console.log(`Skipped (already exists): ${p.title}`);
      }
    }

    console.log("Import completed successfully.");
  } catch (err) {
    console.error("Error during import:", err);
  } finally {
    await client.end();
  }
}

importAnimals();
