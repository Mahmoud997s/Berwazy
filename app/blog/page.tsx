"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  Loader2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function BlogListPage() {
  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/blog"],
    queryFn: async () => {
      const res = await fetch("/api/v1/blog");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const featured = posts && posts.length > 0 ? posts[0] : null;
  const rest = posts && posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="flex flex-col">
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,90,0,0.08),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 md:px-8 relative z-10 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6">
            The Journal
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[0.85]">
            Insights <span className="text-primary">&</span> Stories
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore the intersection of art, design, and poster culture. From
            behind‑the‑scenes looks to deep dives into history.
          </p>
        </motion.div>
      </section>

      {/* ─── Featured Post ───────────────────────────── */}
      {featured && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
              >
                {/* Image */}
                <div className="aspect-[4/3] lg:aspect-auto relative overflow-hidden">
                  {featured.imageUrl ? (
                    <img
                      src={featured.imageUrl}
                      alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <FileText className="w-16 h-16 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest">
                      <BookOpen className="w-3 h-3" />
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 space-y-6">
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-primary" />
                      {format(
                        new Date(
                          featured.publishedAt || featured.createdAt
                        ),
                        "MMM d, yyyy"
                      )}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-primary" />
                      {Math.ceil(
                        (featured.content?.length || 0) / 1500
                      )}{" "}
                      Min Read
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter leading-[0.9] group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>

                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                    {featured.excerpt ||
                      "Dive into the latest insights from our team of designers and art enthusiasts."}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary group-hover:gap-4 transition-all pt-2">
                    Read Article{" "}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Post Grid ───────────────────────────────── */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          {rest.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
                More <span className="text-primary">Articles</span>
              </h2>
            </motion.div>
          )}

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {rest.length > 0 ? (
              rest.map((post) => (
                <motion.div
                  key={post.id}
                  variants={fadeUp}
                  className="group"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block h-full rounded-2xl border border-border/50 bg-background overflow-hidden hover:border-primary/30 transition-all duration-500"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[16/10] relative overflow-hidden">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <FileText className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Text */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-primary" />
                          {format(
                            new Date(
                              post.publishedAt || post.createdAt
                            ),
                            "MMM d, yyyy"
                          )}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-primary" />
                          {Math.ceil(
                            (post.content?.length || 0) / 1500
                          )}{" "}
                          Min
                        </span>
                      </div>

                      <h3 className="text-lg font-black italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {post.excerpt ||
                          "Explore insights from our team of designers and fans."}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary pt-1 group-hover:gap-3 transition-all">
                        Read More{" "}
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              !featured && (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-2xl">
                  <BookOpen className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">
                    Journal coming soon...
                  </p>
                </div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground">
              Ready to <span className="text-primary">explore?</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Browse our curated collections of premium posters and find the
              perfect piece for your space.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300"
              >
                <Link href="/collections/football-posters">
                  Shop Collection{" "}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
