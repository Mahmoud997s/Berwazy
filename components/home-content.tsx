"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/hooks/use-shop";
import { ProductCard } from "@/components/product-card";
import { HeroSection } from "@/components/hero-section";
import { CollectionsSection } from "@/components/collections-section";
import { Collection } from "@/shared/schema";

interface HomeContentProps {
  collections: Collection[];
}

export function HomeContent({ collections }: HomeContentProps) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Trust Bar */}
      <section className="py-8 border-b border-border bg-card">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span>4.9/5 Average Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Free Shipping Over €100</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Fast Global Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Premium 200gsm Paper</span>
          </div>
        </div>
      </section>

      {/* Curated Collections Carousel */}
      <CollectionsSection collections={collections} />

      <FeaturedProducts />
    </div>
  );
}

function FeaturedProducts() {
  const { data, isLoading } = useCollection("football-posters", { limit: "4" });
  const products = data?.pages[0]?.items || [];

  if (isLoading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Our Curated Selection</span>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Featured <span className="text-primary">Posters</span></h2>
          </div>
          <Button asChild variant="ghost" className="text-foreground hover:text-primary font-bold uppercase tracking-widest p-0 h-auto hover:bg-transparent">
            <Link href="/collections/football-posters" className="flex items-center gap-2">
              View All Football <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
