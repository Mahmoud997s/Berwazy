import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { CartResponse } from "@shared/schema";
import { useUi } from "@/components/ui-context";

export function useCart() {
  return useQuery<CartResponse>({
    queryKey: [api.cart.get.path],
    queryFn: async () => {
      const res = await fetch(api.cart.get.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return { items: [] } as unknown as CartResponse;
        throw new Error("Failed to fetch cart");
      }
      return res.json();
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { setCartOpen } = useUi();

  return useMutation({
    mutationFn: async (data: { variantId: number; qty: number }) => {
      const validated = api.cart.addItem.input.parse(data);
      const res = await fetch(api.cart.addItem.path, {
        method: api.cart.addItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to add to cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
      setCartOpen(true);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, qty }: { id: number; qty: number }) => {
      const validated = api.cart.updateItem.input.parse({ qty });
      const url = api.cart.updateItem.path.replace(":id", String(id));
      const res = await fetch(url, {
        method: api.cart.updateItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cart item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = api.cart.deleteItem.path.replace(":id", String(id));
      const res = await fetch(url, {
        method: api.cart.deleteItem.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove cart item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cart.get.path] });
    },
  });
}
