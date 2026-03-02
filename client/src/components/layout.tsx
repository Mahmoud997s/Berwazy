import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingBag, Menu, User, X, ChevronDown } from "lucide-react";
import { useUi } from "./ui-context";
import { CartDrawer } from "./cart-drawer";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { setCartOpen } = useUi();
  const { data: cart } = useCart();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const totalItems = cart?.items?.reduce((acc, item) => acc + item.qty, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-[10px] md:text-xs py-2 px-4 text-center tracking-widest uppercase font-medium">
        Free worldwide shipping on orders over €100
      </div>

      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm h-16" : "bg-white h-20"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-black"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Desktop Navigation - Left */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-bold uppercase tracking-widest">
            <Link href="/collections/football-posters" className="hover:opacity-60 transition-opacity">
              Football
            </Link>
            <div className="group relative cursor-pointer flex items-center gap-1 hover:opacity-60 transition-opacity">
              Shop All <ChevronDown className="w-3 h-3" />
              <div className="absolute top-full left-0 pt-4 hidden group-hover:block">
                <div className="bg-white border shadow-xl p-4 min-w-[200px] flex flex-col gap-3">
                  <Link href="/collections/new" className="hover:underline">New Arrivals</Link>
                  <Link href="/collections/bestsellers" className="hover:underline">Bestsellers</Link>
                  <Link href="/collections/vintage" className="hover:underline">Vintage</Link>
                </div>
              </div>
            </div>
            <Link href="/collections/sale" className="text-red-600 hover:opacity-80 transition-opacity">
              Sale
            </Link>
          </nav>
          
          {/* Logo - Center */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-xl md:text-2xl font-black tracking-tighter uppercase italic">
            ArtsyFartsy<span className="text-red-600">.</span>
          </Link>
          
          {/* Icons - Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/search" className="p-2 text-black hover:opacity-60 transition-opacity">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/account" className="hidden sm:block p-2 text-black hover:opacity-60 transition-opacity">
              <User className="w-5 h-5" />
            </Link>
            <button 
              className="p-2 text-black hover:opacity-60 transition-opacity relative group"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full group-hover:bg-red-600 transition-colors">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[51] md:hidden"
              />
              <motion.nav 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[52] md:hidden shadow-2xl flex flex-col p-8 pt-20"
              >
                <div className="flex flex-col gap-6 text-xl font-black uppercase italic tracking-tight">
                  <Link href="/collections/football-posters">Football</Link>
                  <Link href="/collections/vintage">Vintage</Link>
                  <Link href="/collections/abstract">Abstract</Link>
                  <Link href="/collections/sale" className="text-red-600">Sale</Link>
                </div>
                
                <div className="mt-auto pt-8 border-t flex flex-col gap-4 text-sm font-bold uppercase tracking-widest">
                  <Link href="/account">My Account</Link>
                  <Link href="/search">Search</Link>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-black text-white py-16 mt-20">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-6">ARTSYFARTSY<span className="text-red-600">.</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Premium quality posters designed for the modern home. 
              Elevate your space with our curated collection of sports and lifestyle prints.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/collections/football-posters" className="hover:text-white transition-colors">Football</Link></li>
              <li><Link href="/collections/vintage" className="hover:text-white transition-colors">Vintage</Link></li>
              <li><Link href="/collections/abstract" className="hover:text-white transition-colors">Abstract</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Join the Club</h4>
            <p className="text-gray-400 text-sm mb-4">Get 10% off your first order when you sign up.</p>
            <div className="flex border-b border-gray-700 pb-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent text-xs w-full focus:outline-none placeholder:text-gray-600 uppercase font-bold tracking-widest" 
              />
              <button className="text-xs font-bold uppercase tracking-widest hover:text-red-600 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-gray-900 text-[10px] text-gray-600 uppercase tracking-widest flex flex-col md:flex-row justify-between gap-4">
          <p>© 2026 ARTSYFARTSY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Cookies</Link>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
