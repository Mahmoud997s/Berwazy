import { db } from "@/lib/db";
import { products, productImages, variants, storeSettings } from "@/shared/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import { ProductDetails } from "@/components/product-details";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (!product) return {};

  const settings = await db.select().from(storeSettings);
  const storeName = settings.find(s => s.key === 'store_name')?.value || 'BRAWEZZ.';
  const description = settings.find(s => s.key === 'store_slogan')?.value || 'Premium quality football posters.';

  return constructMetadata(product, { storeName, description });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      images: true,
      variants: true,
    }
  });

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": product.images?.[0]?.url,
    "offers": {
      "@type": "AggregateOffer",
      "availability": product.variants?.some(v => v.inStock) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceCurrency": "USD",
      "lowPrice": Math.min(...(product.variants?.map(v => v.priceCents) || [0])) / 100,
      "highPrice": Math.max(...(product.variants?.map(v => v.priceCents) || [0])) / 100,
      "offerCount": product.variants?.length || 0
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.ratingAvg,
      "reviewCount": product.ratingCount
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails 
        product={product} 
        images={product.images || []} 
        variants={product.variants || []} 
      />
    </>
  );
}
