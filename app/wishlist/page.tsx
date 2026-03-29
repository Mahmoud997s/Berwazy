"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/product-card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { wishlist, isLoading } = useWishlist();

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-full max-w-md space-y-10">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-2 border-border/50">
            <Heart className="w-10 h-10 text-muted-foreground opacity-30" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Your Wishlist</h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold italic leading-relaxed">
              Please sign in to see your saved items and sync your wishlist across all your devices.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/auth/signin")} 
            variant="outline"
            className="rounded-none px-12 h-14 uppercase font-black italic tracking-tighter transition-all hover:bg-primary hover:text-primary-foreground border-2"
          >
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-24 md:pt-32 pb-24 px-4 bg-background/50">
      <div className="w-full max-w-6xl space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 border-b-2 border-border pb-10">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">My Wishlist</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black italic">
              {wishlist.length} {wishlist.length === 1 ? 'Poster' : 'Posters'} Saved in total
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-none uppercase font-black italic tracking-tighter text-[10px] hover:bg-transparent hover:text-primary">
            <Link href="/collections/football-posters">Continue Shopping &rarr;</Link>
          </Button>
        </div>

      {wishlist.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-muted/30 border-2 border-dashed border-border rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground opacity-20" />
          </div>
          <div className="space-y-3">
            <p className="text-xl font-black uppercase italic tracking-tighter">Your wishlist is empty</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold max-w-xs">Start building your dream collection with our premium posters.</p>
          </div>
          <Button asChild variant="outline" className="rounded-none px-10 h-14 border-2 uppercase font-black italic tracking-tighter">
            <Link href="/collections/football-posters">Explore Collections</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence>
            {wishlist.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  </div>
);
}
