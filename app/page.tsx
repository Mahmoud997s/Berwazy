import { HomeContent } from "@/components/home-content";
import { db } from "@/lib/db";
import { storeSettings, collections } from "@/shared/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const settingsArray = await db.select().from(storeSettings);
  const settings: Record<string, string> = {};
  settingsArray.forEach(s => {
    settings[s.key] = s.value;
  });

  const activeCollections = await db.select()
    .from(collections)
    .where(eq(collections.isActive, true))
    .orderBy(asc(collections.sort));

  console.log(`[HomePage] Found ${activeCollections.length} active collections`);

  const storeName = settings.store_name || 'BRAWEZZ.';
  const slogan = settings.store_slogan || 'Premium quality football and abstract posters.';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": storeName,
    "alternateName": [storeName, "Football Poster Display"],
    "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    "description": slogan,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": storeName,
    "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    "logo": settings.favicon_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/favicon.ico`,
    "description": slogan
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeContent collections={activeCollections} />
    </>
  );
}

