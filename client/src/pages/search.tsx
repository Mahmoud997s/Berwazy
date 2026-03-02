import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { useLocation } from "wouter";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const q = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(q);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 min-h-[60vh]">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-display font-bold">Search</h1>
          
          <form onSubmit={handleSearch} className="relative flex items-center">
            <SearchIcon className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for posters, styles, colors..." 
              className="w-full bg-muted border border-border rounded-full py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-foreground text-background px-6 rounded-full font-medium hover:bg-foreground/90 transition-colors">
              Search
            </button>
          </form>

          {q && (
            <div className="pt-16 space-y-6">
              <h2 className="text-2xl font-medium">Results for "{q}"</h2>
              
              <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-12 text-center">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg">No results found.</p>
                <p className="text-muted-foreground mt-2">Try adjusting your search terms or browse our collections.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
