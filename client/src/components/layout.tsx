import { ReactNode } from "react";
import { Link } from "wouter";
import { Search, ShoppingBag, Menu, User } from "lucide-react";
import { useUi } from "./ui-context";
import { CartDrawer } from "./cart-drawer";
import { useCart } from "@/hooks/use-cart";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const { setCartOpen } = useUi();
  const { data: cart } = useCart();
  
  const totalItems = cart?.items?.reduce((acc, item) => acc + item.qty, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-nav">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <button className="p-2 -ml-2 text-foreground/80 hover:text-foreground">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <Link href="/" className="text-2xl font-display font-bold tracking-tight">
            ArtsyFartsy.
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/collections/football-posters" className="hover:text-muted-foreground transition-colors">
              Football
            </Link>
            <Link href="/collections/vintage" className="hover:text-muted-foreground transition-colors">
              Vintage
            </Link>
            <Link href="/collections/abstract" className="hover:text-muted-foreground transition-colors">
              Abstract
            </Link>
          </nav>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/search" className="p-2 text-foreground/80 hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/account" className="hidden sm:block p-2 text-foreground/80 hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button 
              className="p-2 text-foreground/80 hover:text-foreground transition-colors relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 bg-foreground text-background text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-foreground text-background py-16 mt-20">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-display text-2xl font-bold mb-6">ArtsyFartsy.</h3>
            <p className="text-muted/60 max-w-sm">
              Curated posters for the modern enthusiast. Transform your space with premium quality prints.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-6">Shop</h4>
            <ul className="space-y-4 text-muted/60">
              <li><Link href="/collections/football-posters" className="hover:text-white transition-colors">Football</Link></li>
              <li><Link href="/collections/vintage" className="hover:text-white transition-colors">Vintage</Link></li>
              <li><Link href="/collections/abstract" className="hover:text-white transition-colors">Abstract</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-muted/60">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-6">Newsletter</h4>
            <p className="text-muted/60 mb-4 text-sm">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bg-white/10 border border-white/20 rounded-l-md px-4 py-2 w-full focus:outline-none focus:border-white/40" />
              <button className="bg-white text-black px-4 py-2 rounded-r-md font-medium hover:bg-white/90">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
