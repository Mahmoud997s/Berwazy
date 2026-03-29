import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "../shared/schema";

async function check() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Checking email templates...");
  const templates = await db.select().from(schema.emailTemplates);
  console.log("Count:", templates.length);
  console.log("Names:", templates.map(t => t.name));
  
  await pool.end();
}

check().catch(console.error);
