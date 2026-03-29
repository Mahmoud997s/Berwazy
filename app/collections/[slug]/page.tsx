import { db } from "@/lib/db";
import { collections, storeSettings } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { CollectionDetails } from "@/components/collection-details";

export const dynamic = 'force-dynamic';

import { VirtualCollectionDetails } from "@/components/virtual-collection-details";

const VIRTUAL_COLLECTIONS: Record<string, { title: string; description: string; sort: string }> = {
  new: {
    title: "New Arrivals",
    description: "The latest additions to our exclusive football poster collection. Fresh designs, legendary moments.",
    sort: "newest"
  },
  bestsellers: {
    title: "Bestsellers",
    description: "Our most popular football posters as chosen by fans around the world. The absolute favorites.",
    sort: "popular"
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  if (VIRTUAL_COLLECTIONS[slug]) {
    const vc = VIRTUAL_COLLECTIONS[slug];
    const settings = await db.select().from(storeSettings);
    const storeName = settings.find(s => s.key === 'store_name')?.value || 'BRAWEZZ.';
    return constructMetadata({ title: vc.title, description: vc.description, slug } as any, { storeName, description: vc.description });
  }

  const collection = await db.query.collections.findFirst({
    where: eq(collections.slug, slug),
  });

  if (!collection) return {};

  const settings = await db.select().from(storeSettings);
  const storeName = settings.find(s => s.key === 'store_name')?.value || 'BRAWEZZ.';
  const description = settings.find(s => s.key === 'store_slogan')?.value || 'Premium quality football posters.';

  return constructMetadata(collection, { storeName, description });
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (VIRTUAL_COLLECTIONS[slug]) {
    const vc = VIRTUAL_COLLECTIONS[slug];
    return <VirtualCollectionDetails {...vc} />;
  }

  const collection = await db.query.collections.findFirst({
    where: eq(collections.slug, slug),
  });

  if (!collection) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collection.title,
    "description": collection.description,
    "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/collections/${collection.slug}`,
    "image": collection.imageUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CollectionDetails collection={collection} />
    </>
  );
}
