import { Metadata } from 'next';
import { Product, Collection, BlogPost } from '@/shared/schema';

export function constructMetadata(
  item?: Partial<Product | Collection | BlogPost> & { 
    seoTitle?: string | null; 
    seoDescription?: string | null; 
    ogImage?: string | null; 
    canonicalUrl?: string | null; 
    robots?: string | null;
    schemaJson?: string | null;
  },
  defaults?: {
    storeName: string;
    description: string;
    ogImage?: string;
  }
): Metadata {
  const title = item?.seoTitle || (item as any)?.title || defaults?.storeName;
  const description = item?.seoDescription || (item as any)?.description || defaults?.description;
  const image = item?.ogImage || defaults?.ogImage;

  return {
    title: item?.seoTitle ? `${item.seoTitle} | ${defaults?.storeName}` : title,
    description,
    alternates: {
      canonical: item?.canonicalUrl || undefined,
    },
    robots: item?.robots || 'index, follow',
    openGraph: {
      title: item?.seoTitle || title,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: item?.seoTitle || title,
      description,
      images: image ? [image] : [],
    },
    other: item?.schemaJson ? {
      'script:ld+json': item.schemaJson
    } : undefined
  };
}
