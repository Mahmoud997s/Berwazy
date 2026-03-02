import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function Checkout() {
  const { data: cart } = useCart();
  const items = cart?.items || [];
  
  const subtotal = items.reduce(
    (acc, item) => acc + item.qty * item.unitPriceCents,
    0
  );

  return (
    <Layout>
      <div className="bg-muted min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-background rounded-2xl shadow-xl p-8 md:p-10 text-center space-y-6 border border-border">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-display font-bold">Checkout Mockup</h1>
          
          <p className="text-muted-foreground">
            This is a placeholder for the checkout flow. In a real app, this would integrate with Stripe.
          </p>

          <div className="bg-muted p-6 rounded-xl text-left space-y-4 mt-6">
            <h3 className="font-semibold border-b border-border pb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Order Summary
            </h3>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate pr-4 text-muted-foreground">
                  {item.qty}x {item.variant.product.title}
                </span>
                <span className="font-medium">${((item.unitPriceCents * item.qty) / 100).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 border-t border-border font-bold text-lg">
              <span>Total</span>
              <span>${(subtotal / 100).toFixed(2)}</span>
            </div>
          </div>

          <Link href="/" className="btn-premium w-full py-4 mt-8">
            Return Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
