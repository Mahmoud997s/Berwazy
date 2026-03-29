import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { collections } from './shared/schema';

const { Pool } = pg;

const NEW_CATEGORIES = [
  {
    title: "Featured",
    slug: "featured",
    description: "Our curated selection of premium posters.",
    imageUrl: "/images/hero/featured.png",
    sort: 1,
    isActive: true,
  },
  {
    title: "Sports",
    slug: "sports",
    description: "Iconic moments from the world of sports, framed.",
    imageUrl: "/images/hero/sports.png",
    sort: 2,
    isActive: true,
  },
  {
    title: "Anime",
    slug: "anime",
    description: "Vibrant and design-forward anime art pieces.",
    imageUrl: "/images/hero/anime.png",
    sort: 3,
    isActive: true,
  },
  {
    title: "Cinema",
    slug: "cinema",
    description: "Timeless classic and modern film posters.",
    imageUrl: "/images/hero/cinema.webp",
    sort: 4,
    isActive: true,
  },
  {
    title: "Music",
    slug: "music",
    description: "Expressive album art and music-inspired designs.",
    imageUrl: "/images/hero/music.png",
    sort: 5,
    isActive: true,
  },
  {
    title: "Cars",
    slug: "cars",
    description: "Iconic automotive history and modern exotic cars.",
    imageUrl: "/images/hero/cars.png",
    sort: 6,
    isActive: true,
  }
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema: { collections } });

  try {
    console.log("--- Seeding 6 New Categories ---");
    
    for(const cat of NEW_CATEGORIES) {
       try {
         await db.insert(collections).values(cat).onConflictDoUpdate({
           target: collections.slug,
           set: {
             title: cat.title,
             description: cat.description,
             imageUrl: cat.imageUrl,
             sort: cat.sort,
             isActive: cat.isActive
           }
         });
         console.log(`Successfully upserted: ${cat.title}`);
       } catch(e) {
         console.log(`Error upserting ${cat.title}:`, e);
       }
    }

  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await pool.end();
  }
}

seed().then(() => console.log("Done."));
