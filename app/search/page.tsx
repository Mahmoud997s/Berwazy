"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

import { useProducts } from "@/hooks/use-shop";
import { ProductCard } from "@/components/product-card";
import { Loader2 } from "lucide-react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(q);

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useProducts({ search: q, limit: "12" });

  const products = data?.pages.flatMap(page => page.items) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="flex flex-col items-center pt-24 md:pt-32 pb-24 px-4 min-h-[70vh]">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <div className="w-full max-w-6xl text-center space-y-12">
          <div className="max-w-2xl mx-auto w-full space-y-8">
            <h1 className="text-4xl font-display font-bold italic uppercase tracking-tighter">Search</h1>
            
            <form onSubmit={handleSearch} className="relative flex items-center w-full group">
              <SearchIcon className="absolute left-5 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for posters, styles, colors..." 
                className="w-full bg-muted/50 border-2 border-border rounded-none py-5 pl-14 pr-32 text-lg focus:outline-none focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary text-primary-foreground px-8 rounded-none font-bold uppercase tracking-widest italic hover:opacity-90 transition-all">
                Search
              </button>
            </form>
          </div>

          {q && (
            <div className="w-full pt-16 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-border flex-1" />
                <h2 className="text-sm font-bold tracking-widest uppercase italic px-4 text-muted-foreground">
                  Found {data?.pages[0]?.total || 0} results for "{q}"
                </h2>
                <div className="h-px bg-border flex-1" />
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-muted/10 border-2 border-dashed border-border rounded-none p-16 md:p-24 text-center">
                  <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                  <p className="text-xl font-bold uppercase italic tracking-tighter">No results found.</p>
                  <p className="text-muted-foreground text-sm mt-3 uppercase tracking-widest font-medium">Try adjusting your search terms or exploring our collections.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {hasNextPage && (
                    <div className="flex justify-center pt-8">
                      <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="border-2 border-foreground py-4 px-12 text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all disabled:opacity-50"
                      >
                        {isFetchingNextPage ? "Loading..." : "Load More Results"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
