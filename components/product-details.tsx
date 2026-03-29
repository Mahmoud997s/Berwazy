"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAddToCart } from "@/hooks/use-cart";
import { Product, ProductImage, Variant } from "@/shared/schema";

interface ProductDetailsProps {
  product: Product;
  images: ProductImage[];
  variants: Variant[];
}

export function ProductDetails({ product, images, variants }: ProductDetailsProps) {
  const addToCart = useAddToCart();
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    if (images.length > 0) setActiveImage(images[0].url);
    if (variants.length > 0) {
      setSelectedMaterial(variants[0].material);
      setSelectedSize(variants[0].size);
    }
  }, [images, variants]);

  const materials = Array.from(new Set(variants.map((v) => v.material)));
  const availableSizes = variants.filter((v) => v.material === selectedMaterial).map((v) => v.size);
  const selectedVariant = variants.find((v) => v.material === selectedMaterial && v.size === selectedSize) || variants[0];
  
  const originalPrice = product.isSale && product.salePct 
    ? Math.round(selectedVariant.priceCents / (1 - product.salePct / 100)) 
    : null;

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart.mutate({ variantId: selectedVariant.id, qty: 1 });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/collections/all" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-4 lg:sticky lg:top-28 h-fit">
          <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-visible">
            {images.length === 0 ? (
              <div className="w-20 h-24 bg-muted rounded-lg shrink-0 border-2 border-foreground"></div>
            ) : (
              images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-24 shrink-0 rounded-lg overflow-hidden transition-all ${activeImage === img.url ? 'border-2 border-foreground' : 'opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))
            )}
          </div>
          
          <div className="flex-1 order-1 md:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] w-full bg-muted rounded-2xl overflow-hidden shadow-sm"
              >
                <img 
                  src={activeImage || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full lg:w-1/2 pt-4 lg:pt-10">
          {product.isSale && (
            <div className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              Sale {product.salePct}% Off
            </div>
          )}
          
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
            {product.title}
          </h1>
          
          <div className="flex items-end gap-4 mb-6">
            <span className="text-3xl font-medium">
              ${(selectedVariant?.priceCents / 100 || 0).toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-xl text-muted-foreground line-through mb-1">
                ${(originalPrice / 100).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-8">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(product.ratingAvg) || 0) ? 'fill-primary text-primary' : 'text-muted'}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.ratingAvg}</span>
            <span className="text-sm text-muted-foreground underline cursor-pointer hover:text-foreground">({product.ratingCount} reviews)</span>
          </div>

          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            {product.description || "A breathtaking piece that adds depth and character to any space. Printed on archival, museum-quality materials."}
          </p>

          <div className="space-y-8 mb-10 border-y border-border py-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Material</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {materials.map(mat => (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`px-6 py-3 rounded-full border transition-all ${
                      selectedMaterial === mat 
                        ? 'border-primary bg-primary text-primary-foreground font-medium' 
                        : 'border-border bg-transparent text-foreground hover:border-primary/40'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Size</h3>
                <button className="text-sm text-muted-foreground underline hover:text-foreground">Size Guide</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl border transition-all text-center ${
                      selectedSize === size 
                        ? 'border-primary bg-primary/10 text-primary font-medium' 
                        : 'border-border bg-transparent text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending || !selectedVariant?.inStock}
            className="w-full btn-premium shadow-xl shadow-primary/10"
          >
            {addToCart.isPending ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Adding...</span>
            ) : !selectedVariant?.inStock ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </button>

          <div className="mt-8 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-foreground" />
              <span>Free shipping on all orders over $150. Delivery in 3-5 days.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-foreground" />
              <span>Museum-quality guarantee. 30-day free returns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
