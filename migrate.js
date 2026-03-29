const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!match) { console.error('DATABASE_URL not found'); process.exit(1); }

const pool = new Pool({ connectionString: match[1].trim() });

async function run() {
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[]");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS related_products (
      product_id integer NOT NULL,
      related_product_id integer NOT NULL,
      PRIMARY KEY (product_id, related_product_id)
    )
  `);
  console.log('Database schema updated: tags and related_products');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
