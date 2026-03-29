const { Client } = require('pg');

// DB connection string from env
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/football_posters";

async function runImport() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connected to database...");

  try {
    // 1. Fetch live data from Shopify
    console.log("Fetching live product data from Artsy Fartsy...");
    const response = await fetch("https://artsyfartsy.de/en/collections/animals-1/products.json?limit=250");
    const data = await response.json();
    const products = data.products;
    console.log(`Found ${products.length} products.`);

    // 2. Get the Animals collection ID
    const collectionRes = await client.query("SELECT id FROM collections WHERE slug = 'animals'");
    if (collectionRes.rows.length === 0) {
      throw new Error("Animals collection not found. Please create it first.");
    }
    const collectionId = collectionRes.rows[0].id;

    // 3. Clean up existing animal products and their links
    console.log("Cleaning up existing animal products...");
    
    // Get list of products in this collection first
    const existingProductsRes = await client.query(`
      SELECT product_id FROM collection_products WHERE collection_id = $1
    `, [collectionId]);
    const existingProductIds = existingProductsRes.rows.map(r => r.product_id);

    if (existingProductIds.length > 0) {
      // Delete variants (snake_case: price_cents, in_stock)
      await client.query(`DELETE FROM variants WHERE product_id = ANY($1)`, [existingProductIds]);
      // Delete images
      await client.query(`DELETE FROM product_images WHERE product_id = ANY($1)`, [existingProductIds]);
      // Delete collection links
      await client.query(`DELETE FROM collection_products WHERE collection_id = $1`, [collectionId]);
      // Delete products (snake_case: is_sale, sale_pct)
      await client.query(`DELETE FROM products WHERE id = ANY($1)`, [existingProductIds]);
    }

    // 4. Import products
    for (const p of products) {
      const slug = p.handle;
      const title = p.title;
      const description = p.body_html.replace(/<[^>]*>?/gm, '').substring(0, 500); // Strip HTML
      const tags = p.tags;
      
      console.log(`Importing: ${title}`);

      // Insert product (snake_case: is_sale, sale_pct, created_at)
      const productInsert = await client.query(`
        INSERT INTO products (slug, title, description, orientation, color, is_sale, tags, created_at)
        VALUES ($1, $2, $3, 'portrait', 'colorful', false, $4, $5)
        RETURNING id
      `, [
        slug, 
        title, 
        description,
        tags,
        p.created_at
      ]);
      const productId = productInsert.rows[0].id;

      // Link to collection
      await client.query(`
        INSERT INTO collection_products (collection_id, product_id)
        VALUES ($1, $2)
      `, [collectionId, productId]);

      // Add Variants (snake_case: price_cents, in_stock)
      for (const v of p.variants) {
        const parts = v.title.split(' / ');
        const material = parts[0] || 'Poster';
        const size = parts[1] || '50X70 CM';

        try {
          await client.query(`
            INSERT INTO variants (product_id, material, size, price_cents, sku, in_stock)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            productId,
            material,
            size,
            Math.round(parseFloat(v.price) * 100),
            v.sku,
            v.available
          ]);
        } catch (vErr) {
          console.error(`Failed to insert variant ${v.sku} for product ${slug}:`, vErr.message);
        }
      }

      // Add Images (snake_case: product_id, url)
      for (const img of p.images) {
        await client.query(`
          INSERT INTO product_images (product_id, url, alt, sort)
          VALUES ($1, $2, $3, $4)
        `, [
          productId,
          img.src,
          title,
          img.position
        ]);
      }
    }

    console.log("Import completed successfully!");
  } catch (err) {
    console.error("Import failed:", err);
  } finally {
    await client.end();
  }
}

runImport();
