import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useUi } from "./ui-context";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { Link } from "wouter";

export function CartDrawer() {
  const { isCartOpen, setCartOpen } = useUi();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const items = cart?.items || [];
  
  const subtotal = items.reduce(
    (acc, item) => acc + item.qty * item.unitPriceCents,
    0
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col border-l border-border"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" /> Your Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-24 bg-muted rounded-md" />
                      <div className="flex-1 space-y-2 py-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                  <p className="text-lg">Your cart is beautifully empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-4 px-6 py-2 rounded-full border border-border hover:bg-muted transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-32 bg-muted rounded-md overflow-hidden shrink-0">
                      {/* abstract poster placeholder */}
                      <img
                        src={
                          item.variant.product.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=400&auto=format&fit=crop"
                        }
                        alt={item.variant.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div>
                        <h3 className="font-semibold line-clamp-1">
                          {item.variant.product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.variant.material} • {item.variant.size}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-full">
                          <button
                            onClick={() => {
                              if (item.qty > 1) {
                                updateItem.mutate({ id: item.id, qty: item.qty - 1 });
                              }
                            }}
                            disabled={updateItem.isPending || item.qty <= 1}
                            className="p-2 hover:text-primary/70 transition-colors disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              updateItem.mutate({ id: item.id, qty: item.qty + 1 })
                            }
                            disabled={updateItem.isPending}
                            className="p-2 hover:text-primary/70 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            ${((item.unitPriceCents * item.qty) / 100).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem.mutate(item.id)}
                            disabled={removeItem.isPending}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex justify-between mb-4 text-lg font-medium">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  className="w-full btn-premium py-4 text-lg block text-center"
                  onClick={() => setCartOpen(false)}
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
