import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useCollection } from "@/hooks/use-shop";
import { ProductCard } from "@/components/product-card";
import { Filter, ChevronDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Collection() {
  const { slug } = useParams<{ slug: string }>();
  const [location, setLocation] = useLocation();
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse filters from URL
  const searchParams = new URLSearchParams(window.location.search);
  const filters = {
    orientation: searchParams.get("orientation") || "",
    color: searchParams.get("color") || "",
    size: searchParams.get("size") || "",
    sort: searchParams.get("sort") || "",
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    setLocation(`${location}?${params.toString()}`);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useCollection(slug!, filters);

  const allItems = data?.pages.flatMap((p) => p.items) || [];
  const facets = data?.pages[0]?.facets;
  const total = data?.pages[0]?.total || 0;

  // Derive title from slug
  const title = slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Collection';

  return (
    <Layout>
      <div className="bg-white pt-12 pb-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">{title}</h1>
          <p className="text-gray-400 max-w-2xl text-[10px] font-black uppercase tracking-[0.2em]">
            Premium fine art prints and football posters designed to elevate your environment.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between py-6 mb-8 border-y border-gray-100">
          <button 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors"
            onClick={() => setMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <Filter className="w-3 h-3" /> Filters
          </button>
          
          <div className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {allItems.length} / {total} Products
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sort:</span>
            <select 
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:ring-0 outline-none"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price Low-High</option>
              <option value="price_desc">Price High-Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Desktop Filters */}
          <aside className={`w-full md:w-64 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden'} md:block space-y-8`}>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8">Filters</h3>
              
              <div className="space-y-10">
                {/* Orientation Filter */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Orientation</h4>
                  <div className="space-y-4">
                    {facets?.orientation?.map((f: any) => (
                      <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={filters.orientation === f.value}
                            onChange={() => updateFilter("orientation", filters.orientation === f.value ? "" : f.value)}
                            className="peer appearance-none w-4 h-4 border border-black rounded-none checked:bg-black transition-all cursor-pointer"
                          />
                          <svg className="absolute w-2 h-2 text-white pointer-events-none hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-red-600 transition-colors">{f.value}</span>
                        <span className="text-[10px] font-bold text-gray-300 ml-auto">{f.count}</span>
                      </label>
                    )) || <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">None</p>}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Color</h4>
                  <div className="space-y-4">
                    {facets?.color?.map((f: any) => (
                      <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={filters.color === f.value}
                            onChange={() => updateFilter("color", filters.color === f.value ? "" : f.value)}
                            className="peer appearance-none w-4 h-4 border border-black rounded-none checked:bg-black transition-all cursor-pointer"
                          />
                          <svg className="absolute w-2 h-2 text-white pointer-events-none hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="w-2 h-2 border border-gray-100 shrink-0" style={{ backgroundColor: f.value }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-red-600 transition-colors">{f.value}</span>
                        <span className="text-[10px] font-bold text-gray-300 ml-auto">{f.count}</span>
                      </label>
                    )) || <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">None</p>}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-xl"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">Oops, failed to load collection.</p>
                <p className="text-sm mt-2 opacity-60">This might be because the database is empty or the API is unavailable.</p>
              </div>
            ) : allItems.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allItems.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="mt-16 text-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="border border-black px-12 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                    >
                      {isFetchingNextPage ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}