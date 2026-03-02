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
      <div className="bg-muted py-16 md:py-24 px-4">
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold">{title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of stunning prints. Elevate your aesthetic with premium artwork tailored for your space.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between py-4 border-b border-border mb-8">
          <button 
            className="md:hidden flex items-center gap-2 font-medium border border-border px-4 py-2 rounded-md"
            onClick={() => setMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          
          <div className="hidden md:block text-muted-foreground">
            You're viewing {allItems.length} of {total} products
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
            <select 
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="bg-transparent border-none font-medium cursor-pointer focus:ring-0 outline-none"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Desktop Filters */}
          <aside className={`w-full md:w-64 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden'} md:block space-y-8`}>
            <div>
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              <div className="space-y-6">
                {/* Orientation Filter */}
                <div>
                  <h4 className="font-medium mb-3">Orientation</h4>
                  <div className="space-y-2">
                    {facets?.orientation?.map((f: any) => (
                      <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filters.orientation === f.value}
                          onChange={() => updateFilter("orientation", filters.orientation === f.value ? "" : f.value)}
                          className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground"
                        />
                        <span className="text-sm group-hover:text-primary transition-colors capitalize">{f.value}</span>
                        <span className="text-xs text-muted-foreground ml-auto">({f.count})</span>
                      </label>
                    )) || <p className="text-sm text-muted-foreground">None available</p>}
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="font-medium mb-3">Color</h4>
                  <div className="space-y-2">
                    {facets?.color?.map((f: any) => (
                      <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filters.color === f.value}
                          onChange={() => updateFilter("color", filters.color === f.value ? "" : f.value)}
                          className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground"
                        />
                        <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: f.value }} />
                        <span className="text-sm group-hover:text-primary transition-colors capitalize">{f.value}</span>
                        <span className="text-xs text-muted-foreground ml-auto">({f.count})</span>
                      </label>
                    )) || <p className="text-sm text-muted-foreground">None available</p>}
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
                      className="btn-premium px-8 py-3"
                    >
                      {isFetchingNextPage ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
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
