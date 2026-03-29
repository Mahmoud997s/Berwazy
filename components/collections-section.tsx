"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Collection } from "@/shared/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useCallback, useEffect, useState } from "react";

/* ─────────────────────── props ─────────────────────── */

interface CollectionsSectionProps {
  collections: Collection[];
}

/* ─────────────────── Collection Card ─────────────────── */

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 dark:bg-[#1a1a1a]"
      aria-label={`Explore ${collection.title} collection`}
    >
      {/* Image */}
      {collection.imageUrl ? (
        <img
          src={collection.imageUrl}
          alt={collection.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-[#1a1a1a]">
          <span className="text-2xl font-black italic uppercase tracking-tighter text-zinc-400 dark:text-zinc-700">
            {collection.title}
          </span>
        </div>
      )}

      {/* Overlay gradient — bottom-up for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-colors duration-500 group-hover:from-black/80 group-hover:via-black/30" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 md:p-6">
        {/* Title */}
        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-[#F5F5F3] transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
          {collection.title}
        </h3>

        {/* Subtitle */}
        {collection.description && (
          <p className="text-[13px] font-medium text-[#B8B3A8] line-clamp-1 tracking-wide">
            {collection.description}
          </p>
        )}

        {/* Explore affordance */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-0 transition-all duration-500 ease-out translate-y-1 group-hover:opacity-100 group-hover:translate-y-0">
          Explore
          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

/* ────────────────── Collections Section ────────────────── */

export function CollectionsSection({ collections }: CollectionsSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (!collections || collections.length === 0) return null;

  return (
    <section
      id="collections"
      className="relative py-20 md:py-28 scroll-mt-20 bg-zinc-50 dark:bg-[#161616]"
    >
      {/* Top separator line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/[0.06] to-transparent" />

      <div className="container mx-auto px-4 md:px-8">
        {/* ── Header Row ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          {/* Left: eyebrow + title + subtitle */}
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-[#B8B3A8] mb-3 block">
              Explore by Style
            </span>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground dark:text-[#F5F5F3] mb-3">
              Curated{" "}
              <span className="text-primary">Collections</span>
            </h2>
            <p className="text-sm md:text-[15px] text-zinc-500 dark:text-[#B8B3A8] font-medium tracking-wide leading-relaxed">
              Explore posters curated for every taste and every wall.
            </p>
          </div>

          {/* Right: View All + arrow controls */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/collections"
              className="hidden md:flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-[#B8B3A8] hover:text-primary transition-colors duration-300"
            >
              View All Collections
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Arrow controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label="Previous collections"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/[0.08] text-zinc-500 dark:text-[#B8B3A8] transition-all duration-300 hover:border-black/30 dark:hover:border-white/20 hover:text-foreground dark:hover:text-[#F5F5F3] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-black/10 dark:disabled:hover:border-white/[0.08] disabled:hover:text-zinc-500 dark:disabled:hover:text-[#B8B3A8]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                disabled={!canScrollNext}
                aria-label="Next collections"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/[0.08] text-zinc-500 dark:text-[#B8B3A8] transition-all duration-300 hover:border-black/30 dark:hover:border-white/20 hover:text-foreground dark:hover:text-[#F5F5F3] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-black/10 dark:disabled:hover:border-white/[0.08] disabled:hover:text-zinc-500 dark:disabled:hover:text-[#B8B3A8]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Carousel ── */}
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
            containScroll: "trimSnaps",
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {collections.map((collection) => (
              <CarouselItem
                key={collection.id}
                className="pl-4 md:pl-6 basis-[85%] md:basis-[48%] lg:basis-[33.333%]"
              >
                <CollectionCard collection={collection} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Mobile: View All link */}
        <div className="mt-8 md:hidden flex justify-center">
          <Link
            href="/collections"
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-[#B8B3A8] hover:text-primary transition-colors duration-300"
          >
            View All Collections
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom separator — gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/[0.06] to-transparent" />
    </section>
  );
}
