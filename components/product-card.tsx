import Link from "next/link";
import { Star, Heart } from "lucide-react";
import type { ProductCard as ProductCardType } from "@shared/schema";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductCardType }) {
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const isWishlisted = isInWishlist(product.id);

  // Use first image or fallback to stunning unsplash art
  const imageUrl = product.images?.[0]?.url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop";
  const hoverImageUrl = product.images?.[1]?.url || imageUrl;
  
  // Find min price from variants
  const minPrice = product.variants?.length 
    ? Math.min(...product.variants.map((v) => v.priceCents)) 
    : 0;

  const originalPrice = product.isSale && product.salePct 
    ? Math.round(minPrice / (1 - product.salePct / 100)) 
    : null;

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block cursor-pointer">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          />
          <img
            src={hoverImageUrl}
            alt={`${product.title} alternate`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
          
          {product.isSale && (
            <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] font-black px-3 py-1.5 uppercase tracking-widest italic">
              Sale {product.salePct}%
            </div>
          )}
        </div>
      </Link>

      {user && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={cn(
            "absolute top-4 right-4 p-2 transition-all duration-300 z-10",
            isWishlisted ? "text-primary opacity-100 scale-110" : "text-white opacity-0 group-hover:opacity-100 hover:scale-110"
          )}
        >
          <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
        </button>
      )}

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-sm font-black italic uppercase tracking-tighter line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs font-bold tracking-widest">
              €{(minPrice / 100).toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through tracking-widest">
                €{(originalPrice / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>{product.orientation}</span>
          {Number(product.ratingCount) > 0 && (
            <div className="flex items-center gap-1 text-foreground">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span>{product.ratingAvg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
