"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_TABS = [
  { id: "featured", label: "Featured", image: "/images/hero/featured.png" },
  { id: "sports", label: "Sports", image: "/images/hero/sports.png" },
  { id: "anime", label: "Anime", image: "/images/hero/anime.png" },
  { id: "cinema", label: "Cinema", image: "/images/hero/cinema.webp" },
  { id: "music", label: "Music", image: "/images/hero/music.png" },
] as const;

const CATEGORY_BADGES = [
  { label: "Sports", slug: "sports" },
  { label: "Anime", slug: "anime" },
  { label: "Cinema", slug: "cinema" },
  { label: "Music", slug: "music" },
  { label: "Cars", slug: "cars" },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-cycle tabs every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % HERO_TABS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 15s of inactivity
    setTimeout(() => setIsAutoPlaying(true), 15000);
  };

  const currentTab = HERO_TABS[activeTab];

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
      {/* === Background Images with Crossfade === */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentTab.id}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img
            src={currentTab.image}
            alt={`${currentTab.label} posters on a modern wall`}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* === Overlays === */}
      <div className="absolute inset-0 z-[1] bg-black/40" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

      {/* === Content === */}
      <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center justify-center text-center text-white h-full pt-10">
        {/* Category Tabs */}
        <motion.div
          className="flex items-center gap-1.5 md:gap-2 mb-10 p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {HERO_TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(index)}
              className={`relative px-4 md:px-6 py-2 md:py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-all duration-300 ${
                activeTab === index
                  ? "text-primary-foreground"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {activeTab === index && (
                <motion.div
                  layoutId="activeHeroTab"
                  className="absolute inset-0 bg-primary rounded-full hero-tab-glow"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-black italic tracking-tighter uppercase mb-6 leading-none">
            Frame Your <span className="text-primary">Style.</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-10 mx-auto font-medium tracking-tight leading-relaxed max-w-2xl drop-shadow-md">
            Premium posters and art prints curated for every wall.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300 border-none hover:shadow-lg hover:shadow-primary/25"
          >
            <Link href="/collections">
              Shop All Posters <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300 backdrop-blur-sm"
          >
            <Link href="#categories">Browse Categories</Link>
          </Button>
        </motion.div>

        {/* Category Badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {CATEGORY_BADGES.map((badge, index) => (
            <Link
              key={badge.slug}
              href={`/collections/${badge.slug}`}
              className="group"
            >
              <motion.span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] md:text-xs font-semibold uppercase tracking-widest bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 hover:bg-white/20 hover:text-white hover:border-white/30 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                {badge.label}
              </motion.span>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* === Progress indicator for auto-play === */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center gap-1.5 pb-6">
        {HERO_TABS.map((_, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className="group relative h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: activeTab === index ? "2rem" : "0.5rem" }}
          >
            <span className="absolute inset-0 bg-white/30 rounded-full" />
            {activeTab === index && (
              <motion.span
                className="absolute inset-0 bg-primary rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: isAutoPlaying ? 5 : 0.3, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
