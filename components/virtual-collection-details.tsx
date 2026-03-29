
"use client";

import { useProducts } from "@/hooks/use-shop";
import { ProductCard } from "@/components/product-card";
import { Loader2 } from "lucide-react";

interface VirtualCollectionDetailsProps {
  title: string;
  description: string;
  sort: string;
}

export function VirtualCollectionDetails({ title, description, sort }: VirtualCollectionDetailsProps) {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useProducts({ sort, limit: "12" });

  const products = data?.pages.flatMap((p) => p.items) || [];
  const total = data?.pages[0]?.total || 0;

  return (
    <>
      <div className="bg-background pt-12 pb-8 px-4 border-b border-border">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 text-foreground">{title}</h1>
          <p className="text-muted-foreground max-w-2xl text-[10px] font-black uppercase tracking-[0.2em]">{description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between py-6 mb-8 border-y border-border">
           <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {products.length} / {total} Products
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-muted"></div>
                    <div className="h-4 bg-muted w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-muted/10 border-2 border-dashed border-border">
                <h3 className="text-xl font-bold italic uppercase tracking-tighter">No products found</h3>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="mt-16 text-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="border-2 border-foreground px-12 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                      {isFetchingNextPage ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
