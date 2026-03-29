import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { ProductCard } from "@shared/schema";
import { useAuth } from "./use-auth";

export function useWishlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: wishlist = [], isLoading } = useQuery<ProductCard[]>({
    queryKey: ["/api/v1/wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/v1/wishlist");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`/api/v1/wishlist/${productId}/toggle`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle wishlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/wishlist"] });
    },
  });

  const isInWishlist = (productId: number) => {
    return wishlist.some((item) => item.id === productId);
  };

  return {
    wishlist,
    isLoading,
    toggleWishlist: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    isInWishlist,
  };
}
