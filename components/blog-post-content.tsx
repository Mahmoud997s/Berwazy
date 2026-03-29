"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BlogPost } from "@/shared/schema";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const readTime = Math.ceil((post.content?.length || 0) / 1500);

  return (
    <article className="flex flex-col">
      {/* ─── Hero Image + Title ──────────────────────── */}
      <section className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden bg-black">
        {post.imageUrl ? (
          <motion.img
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="space-y-6"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors"
                >
                  Journal
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">Article</span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 backdrop-blur-md">
                  <Calendar className="w-3 h-3" />
                  {format(
                    new Date(
                      post.publishedAt || post.createdAt || new Date()
                    ),
                    "MMMM d, yyyy"
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {readTime} min read
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter leading-[0.85] text-foreground">
                {post.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                  B
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Words by
                  </p>
                  <p className="font-bold uppercase italic tracking-tighter text-base text-foreground">
                    BRAWEZZ Team
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Content Area ────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Sticky Sidebar — Actions */}
            <aside className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-32 flex flex-col gap-4 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-xl border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-xl border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-7">
              {/* Excerpt */}
              {post.excerpt && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed mb-12 border-l-4 border-primary pl-6"
                >
                  {post.excerpt}
                </motion.p>
              )}

              {/* Article Body */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="prose prose-lg dark:prose-invert prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:font-medium prose-p:leading-relaxed prose-p:text-muted-foreground/80 prose-a:text-primary prose-strong:text-foreground prose-img:rounded-2xl max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Mobile Share Bar */}
              <div className="flex items-center gap-3 pt-8 lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-2 text-xs font-bold uppercase tracking-widest"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Save
                </Button>
              </div>

              {/* Footer Nav */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-16 mt-16 border-t border-border">
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-none gap-3 px-0 h-auto hover:bg-transparent group"
                >
                  <Link href="/blog" className="flex items-center gap-3">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                      Back to Journal
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest px-8 h-12 rounded-none transition-all duration-300"
                >
                  <Link href="/collections/football-posters">
                    Shop Posters <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Sidebar — Context Card */}
            <aside className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                {/* Key Info Card */}
                <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    At a Glance
                  </h4>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Published
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(
                              post.publishedAt ||
                                post.createdAt ||
                                new Date()
                            ),
                            "MMMM d, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Read Time
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {readTime} minute{readTime > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Browse More Card */}
                <div className="p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 space-y-5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Explore More
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "All Articles", href: "/blog" },
                      {
                        label: "Shop Posters",
                        href: "/collections/football-posters",
                      },
                      {
                        label: "Animals Collection",
                        href: "/collections/animals",
                      },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-all duration-300 text-sm font-semibold text-foreground"
                      >
                        {link.label}
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </article>
  );
}
