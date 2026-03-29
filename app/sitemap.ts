import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products, collections } from '@/shared/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const allProducts = await db.select().from(products);
  const allCollections = await db.select().from(collections);

  const productEntries: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.createdAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const collectionEntries: MetadataRoute.Sitemap = allCollections.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...productEntries,
    ...collectionEntries,
  ];
}
