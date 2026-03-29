import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

interface CollectionFilters {
  orientation?: string;
  color?: string;
  size?: string;
  material?: string;
  onSale?: string;
  sort?: string;
  limit?: string;
}

export function useCollection(slug: string, filters: CollectionFilters) {
  return useInfiniteQuery({
    queryKey: [api.collections.get.path, slug, filters],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([k, v]) => {
        if (v) searchParams.set(k, v);
      });
      
      if (pageParam) {
        searchParams.set("cursor", pageParam as string);
      }

      const url = buildUrl(api.collections.get.path, { slug }) + "?" + searchParams.toString();
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Collection not found");
        throw new Error("Failed to fetch collection");
      }
      
      // Validation using Zod
      const data = await res.json();
      return api.collections.get.responses[200].parse(data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: [api.products.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { slug });
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch product");
      }
      
      const data = await res.json();
      return api.products.get.responses[200].parse(data);
    },
  });
}
export function useProducts(filters: { search?: string; sort?: string; limit?: string }) {
  return useInfiniteQuery({
    // @ts-ignore
    queryKey: [api.products.list.path, filters],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) searchParams.set(k, v);
      });
      if (pageParam) searchParams.set("cursor", pageParam as string);

      // @ts-ignore
      const url = api.products.list.path + "?" + searchParams.toString();
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const data = await res.json();
      // @ts-ignore
      return api.products.list.responses[200].parse(data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
}
