import { Link } from "wouter";
import { Star } from "lucide-react";
import type { ProductCard as ProductCardType } from "@shared/schema";

export function ProductCard({ product }: { product: ProductCardType }) {
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
    <Link href={`/product/${product.slug}`} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted hover-lift">
        <img
          src={imageUrl}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <img
          src={hoverImageUrl}
          alt={`${product.title} alternate`}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105"
        />
        
        {product.isSale && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
            Sale {product.salePct}% Off
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary/70 transition-colors">
            {product.title}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            <span className="font-medium">
              ${(minPrice / 100).toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${(originalPrice / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{product.orientation}</span>
          {Number(product.ratingCount) > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{product.ratingAvg}</span>
              <span className="opacity-60">({product.ratingCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
