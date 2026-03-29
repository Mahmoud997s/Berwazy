import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from './shared/schema';

async function test() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    return;
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);
  
  try {
    console.log("--- Checking User Database ---");
    const allUsers = await db.select().from(users);
    console.log(`Total Users: ${allUsers.length}\n`);
    
    allUsers.forEach(u => {
      console.log(`[USER ID: ${u.id}]`);
      console.log(`Name:   ${u.name}`);
      console.log(`Email:  ${u.email}`);
      console.log(`Auth:   ${u.googleId ? 'GOOGLE' : 'PASSWORD'}`);
      console.log(`---`);
    });
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await pool.end();
  }
}

test().catch(console.error);
