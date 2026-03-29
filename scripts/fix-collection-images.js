const { Client } = require('pg');

// DB connection string from env
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/football_posters";

async function populateCollectionImages() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connected to database...");

  try {
    const collectionsRes = await client.query("SELECT id, title, slug FROM collections");
    const collections = collectionsRes.rows;

    for (const col of collections) {
      console.log(`Processing collection: ${col.title}...`);
      
      // Find the first product's first image in this collection
      const imageRes = await client.query(`
        SELECT pi.url 
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        JOIN collection_products cp ON p.id = cp.product_id
        WHERE cp.collection_id = $1
        ORDER BY pi.sort ASC, pi.id ASC
        LIMIT 1
      `, [col.id]);

      if (imageRes.rows.length > 0) {
        const imageUrl = imageRes.rows[0].url;
        console.log(`Found image for ${col.title}: ${imageUrl}`);
        
        await client.query("UPDATE collections SET image_url = $1 WHERE id = $2", [imageUrl, col.id]);
        console.log(`Updated collection ${col.title} image._url`);
      } else {
        console.log(`No images found for collection: ${col.title}`);
      }
    }

    console.log("Population completed successfully!");
  } catch (err) {
    console.error("Population failed:", err);
  } finally {
    await client.end();
  }
}

populateCollectionImages();
