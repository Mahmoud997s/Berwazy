"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, User, X, ChevronDown, Heart } from "lucide-react";
import { useUi } from "@/components/ui-context";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function MainLayout({ 
  children,
  initialSettings 
}: { 
  children: ReactNode;
  initialSettings?: Record<string, string>;
}) {
  const { setCartOpen } = useUi();
  const { data: cart } = useCart();
  const { data: qSettings } = useQuery({
    queryKey: ["/api/v1/settings/public"],
    queryFn: async () => {
      const res = await fetch("/api/v1/settings/public");
      return res.json();
    },
    initialData: initialSettings
  });
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // During hydration, strictly use initialSettings to match server perfectly.
  // After mount, use live settings from useQuery.
  const settings = hasMounted ? (qSettings || initialSettings) : initialSettings;

  const storeName = settings?.store_name || "BRAWEZZ.";
  const logoAnim = settings?.logo_animation || "pulse";
  const navAnim = settings?.navbar_animation || "fade";
  
  const totalItems = cart?.items?.reduce((acc: number, item: any) => acc + item.qty, 0) || 0;

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
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div 
        className="text-white text-[10px] md:text-xs py-2 px-4 text-center tracking-widest uppercase font-medium flex items-center justify-center gap-2"
        style={{ backgroundColor: settings?.announcement_bg_color || "#000000" }}
      >
        {(() => {
          const bannerMessage = settings?.announcement_text || "Free worldwide shipping on orders over €100";
          const linkText = settings?.announcement_link_text;
          const linkUrl = settings?.announcement_link_url;

          if (linkText && linkUrl && bannerMessage.includes(linkText)) {
            const parts = bannerMessage.split(linkText);
            return (
              <span>
                {parts[0]}
                <Link href={linkUrl} className="underline underline-offset-4 hover:opacity-80 transition-opacity font-bold">
                  {linkText}
                </Link>
                {parts[1]}
              </span>
            );
          }

          return (
            <>
              <span>{bannerMessage}</span>
              {linkText && linkUrl && (
                <Link 
                  href={linkUrl} 
                  className="underline underline-offset-4 hover:opacity-80 transition-opacity font-bold"
                >
                  {linkText}
                </Link>
              )}
            </>
          );
        })()}
      </div>

      <header 
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 backdrop-blur-xl",
          isScrolled 
            ? "bg-background/85 shadow-lg shadow-black/[0.03] dark:shadow-black/20 border-b border-border/60 h-16" 
            : "bg-background/60 border-b border-transparent h-20",
          navAnim === 'fade' && "animate-fade-in"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 h-full grid grid-cols-3 items-center">
          {/* Left Section: Mobile Menu & Desktop Nav */}
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 text-foreground"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-[11px] lg:text-[13px]">
              <Link href="/" className={cn("nav-link", pathname === "/" && "nav-link-active")}>
                Home
              </Link>
              <Link href="/blog" className={cn("nav-link", pathname.startsWith("/blog") && "nav-link-active")}>
                Blog
              </Link>
              <div className="group relative cursor-pointer">
                <span className={cn("nav-link flex items-center gap-1", pathname.startsWith("/collections") && !pathname.includes("sale") && "nav-link-active")}>
                  Shop All <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                </span>
                <div className="absolute top-full left-0 pt-4 hidden group-hover:block">
                  <div className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border/50 shadow-2xl p-6 min-w-[240px] flex flex-col gap-4 rounded-sm">
                    <Link href="/collections/football-posters" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Football</Link>
                    <Link href="/collections/new" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">New Arrivals</Link>
                    <Link href="/collections/bestsellers" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Bestsellers</Link>
                    <Link href="/collections/vintage" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Vintage</Link>
                  </div>
                </div>
              </div>
              <Link href="/collections/sale" className={cn("nav-link flex items-center gap-1.5", pathname.includes("sale") && "nav-link-active")}>
                Sale
                <span className="bg-primary text-primary-foreground text-[7px] font-black px-1.5 py-[2px] uppercase tracking-wider rounded-sm animate-pulse">
                  HOT
                </span>
              </Link>
            </nav>
          </div>
          
          {/* Center Section: Logo */}
          <div className="flex justify-center">
            <Link 
              href="/" 
              className={`flex items-center transition-all
                ${logoAnim === 'pulse' ? 'animate-pulse-subtle' : ''}
                ${logoAnim === 'float' ? 'animate-float' : ''}
                ${logoAnim === 'glitch' ? 'animate-glitch-hover' : ''}
              `}
            >
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={storeName} className="h-8 md:h-10 w-auto object-contain" />
              ) : (
                <span className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic whitespace-nowrap">
                  {storeName.replace('.', '')}<span className="text-primary">{storeName.endsWith('.') ? '.' : ''}</span>
                </span>
              )}
            </Link>
          </div>
          
          {/* Right Section: Icons */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href="/search" className="p-2 text-foreground hover:text-primary transition-all">
              <Search className="w-5 h-5" strokeWidth={settings?.navbar_icon_style === 'bold' ? 3 : 2} />
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:block p-2 text-foreground hover:text-primary transition-all focus:outline-none">
                    <User className="w-5 h-5" strokeWidth={settings?.navbar_icon_style === 'bold' ? 3 : 2} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-none border-2 shadow-2xl" align="end">
                  <DropdownMenuLabel className="uppercase tracking-widest font-black text-[10px] py-4 px-4 bg-muted/30">
                    {user.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="h-[2px]" />
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild className="uppercase tracking-widest font-bold text-[10px] py-3 cursor-pointer text-primary focus:bg-primary focus:text-primary-foreground">
                      <Link href="/admin/loading">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="uppercase tracking-widest font-bold text-[10px] py-3 cursor-pointer focus:bg-primary focus:text-primary-foreground">
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => logout()}
                    className="uppercase tracking-widest font-bold text-[10px] py-3 cursor-pointer text-red-600 focus:bg-red-600 focus:text-white"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin" className="hidden sm:block p-2 text-foreground hover:text-primary transition-all">
                <User className="w-5 h-5" strokeWidth={settings?.navbar_icon_style === 'bold' ? 3 : 2} />
              </Link>
            )}
            
            <Link 
              href="/wishlist" 
              className="p-2 text-foreground hover:text-primary transition-all relative group"
            >
              <Heart className="w-5 h-5" strokeWidth={settings?.navbar_icon_style === 'bold' ? 3 : 2} />
            </Link>

            <button 
              className="p-2 text-foreground hover:text-primary transition-all relative group"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={settings?.navbar_icon_style === 'bold' ? 3 : 2} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[8px] font-black min-w-[16px] h-4 flex items-center justify-center rounded-full ring-2 ring-background tabular-nums transition-colors">
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
                className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-background z-[52] md:hidden shadow-2xl flex flex-col p-8 pt-20"
              >
                <div className="flex flex-col gap-6 text-xl font-black uppercase italic tracking-tight">
                  <Link href="/">Home</Link>
                  <Link href="/blog">Blog</Link>
                  <Link href="/collections/football-posters">Football</Link>
                  <Link href="/wishlist">Wishlist</Link>
                  <Link href="/collections/vintage">Vintage</Link>
                  <Link href="/collections/abstract">Abstract</Link>
                  <Link href="/collections/sale" className="text-primary">Sale</Link>
                </div>
                
                <div className="mt-auto pt-8 border-t flex flex-col gap-4 text-sm font-bold uppercase tracking-widest">
                  {user ? (
                    <>
                      <div className="text-[10px] text-muted-foreground mb-2">Signed in as {user.name}</div>
                      {user.role === 'admin' && (
                        <Link href="/admin/loading" className="text-primary">Admin Dashboard</Link>
                      )}
                      <Link href="/account">My Account</Link>
                      <button 
                        onClick={() => logout()}
                        className="text-left text-red-600"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/auth/signin">Sign In</Link>
                  )}
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

      <WhatsAppButton 
        phoneNumber={settings?.whatsapp_number} 
        message={settings?.whatsapp_message} 
      />

      <footer className="bg-card text-card-foreground py-16 mt-20 border-t border-border">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-6">
              {storeName.replace('.', '')}<span className="text-primary">{storeName.endsWith('.') ? '.' : ''}</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {settings?.store_slogan || "Premium quality posters designed for the modern home."}
            </p>
            <div className="flex gap-4 mt-6">
              {settings?.social_facebook && (
                <Link href={settings.social_facebook} target="_blank" className="hover:text-primary transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </Link>
              )}
              {settings?.social_instagram && (
                <Link href={settings.social_instagram} target="_blank" className="hover:text-primary transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </Link>
              )}
              {settings?.social_twitter && (
                <Link href={settings.social_twitter} target="_blank" className="hover:text-primary transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </Link>
              )}
              {settings?.social_tiktok && (
                <Link href={settings.social_tiktok} target="_blank" className="hover:text-primary transition-colors">
                  <span className="sr-only">TikTok</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.13-1.03-2.28-1.3-3.06-4.04-2.25-6.42.33-.87 1.05-1.66 1.93-2.09.91-.49 1.96-.64 2.99-.58v4.03c-1.02-.32-2.18.15-2.61 1.17-.46 1.04.05 2.3 1.12 2.79.79.41 1.77.26 2.45-.37.7-.62.88-1.58.89-2.48.06-5.83.01-11.66.02-17.49z"/></svg>
                </Link>
              )}
            </div>
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
              <li><Link href="/support/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/support/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/support/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Join the Club</h4>
            <p className="text-gray-400 text-sm mb-4">Get 10% off your first order when you sign up.</p>
            <div className="flex border-b border-border pb-2">
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
        <div className="container mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-border text-[10px] text-muted-foreground uppercase tracking-widest flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} {storeName} ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
