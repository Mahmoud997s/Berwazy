const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// DB connection string from env
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/football_posters";
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function downloadAndProcessImage(url, altText = '') {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    
    const buffer = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);
    
    const uniqueSuffix = crypto.randomBytes(8).toString('hex') + '-' + Date.now();
    const filename = `${uniqueSuffix}.webp`;
    const filePath = path.join(UPLOADS_DIR, filename);

    const image = sharp(nodeBuffer);
    const metadata = await image.metadata();
    
    const processedBuffer = await image
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    
    fs.writeFileSync(filePath, processedBuffer);
    
    return {
      filename,
      url: `/uploads/${filename}`,
      size: processedBuffer.length,
      mimeType: 'image/webp',
      metadata: JSON.stringify({ width: metadata.width, height: metadata.height }),
      originalName: path.basename(url).split('?')[0]
    };
  } catch (err) {
    console.error(`Error processing ${url}:`, err.message);
    return null;
  }
}

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connected to database...");

  try {
    // 1. Migrate Collection Images
    console.log("Checking collections for external images...");
    const collectionsRes = await client.query("SELECT id, title, image_url FROM collections WHERE image_url LIKE 'http%'");
    console.log(`Found ${collectionsRes.rows.length} collections to update.`);

    for (const row of collectionsRes.rows) {
      console.log(`Migrating collection image: ${row.title}...`);
      const localData = await downloadAndProcessImage(row.image_url, row.title);
      if (localData) {
        // Insert into media table
        const mediaInsert = await client.query(`
          INSERT INTO media (filename, original_name, mime_type, size, url, alt_text, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [localData.filename, localData.originalName, localData.mimeType, localData.size, localData.url, row.title, localData.metadata]);
        
        // Update collection
        await client.query("UPDATE collections SET image_url = $1 WHERE id = $2", [localData.url, row.id]);
        console.log(`Updated collection ${row.title} with local URL: ${localData.url}`);
      }
    }

    // 2. Migrate Product Images
    console.log("Checking products for external images...");
    const productImagesRes = await client.query("SELECT id, url, alt FROM product_images WHERE url LIKE 'http%'");
    console.log(`Found ${productImagesRes.rows.length} product images to migrate.`);

    let count = 0;
    for (const row of productImagesRes.rows) {
      count++;
      console.log(`[${count}/${productImagesRes.rows.length}] Migrating product image: ${row.url}...`);
      const localData = await downloadAndProcessImage(row.url, row.alt);
      if (localData) {
        // Insert into media table
        await client.query(`
          INSERT INTO media (filename, original_name, mime_type, size, url, alt_text, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [localData.filename, localData.originalName, localData.mimeType, localData.size, localData.url, row.alt, localData.metadata]);
        
        // Update product_images table
        await client.query("UPDATE product_images SET url = $1 WHERE id = $2", [localData.url, row.id]);
      }
    }

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
