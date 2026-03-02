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
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        />
        <img
          src={hoverImageUrl}
          alt={`${product.title} alternate`}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />
        
        {product.isSale && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest italic">
            Sale {product.salePct}%
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-sm font-black italic uppercase tracking-tighter line-clamp-1 group-hover:text-red-600 transition-colors">
            {product.title}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs font-bold tracking-widest">
              €{(minPrice / 100).toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-[10px] text-gray-400 line-through tracking-widest">
                €{(originalPrice / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span>{product.orientation}</span>
          {Number(product.ratingCount) > 0 && (
            <div className="flex items-center gap-1 text-black">
              <Star className="w-3 h-3 fill-black text-black" />
              <span>{product.ratingAvg}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
