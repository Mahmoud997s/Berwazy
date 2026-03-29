import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { storeSettings } from '@/shared/schema';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await db.select().from(storeSettings);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const robotsSetting = settings.find(s => s.key === 'robots_txt')?.value;

  if (robotsSetting) {
    // If user provided a full robots.txt content in settings, we might need a different approach 
    // but for MetadataRoute.Robots, we return an object.
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/checkout/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
