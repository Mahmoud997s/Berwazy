import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000&auto=format&fit=crop" 
              alt="Football Stadium" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          <div className="container mx-auto px-4 md:px-8 relative z-10 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                The Beautiful <br /> Game <span className="text-red-600">Framed.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium tracking-tight">
                Premium quality football posters and prints. 
                Designed for the modern enthusiast.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300 border-none">
                  <Link href="/collections/football-posters">
                    Shop Collection <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300">
                  <Link href="/collections/football-posters">View New Arrivals</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-8 border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-red-600 fill-red-600" />
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Free Shipping Over €100</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Fast Global Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Premium 200gsm Paper</span>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/collections/football-posters" className="group relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=800&auto=format&fit=crop" 
                  alt="Football" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Football</h2>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Shop Now <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
              
              <Link href="/collections/football-posters" className="group relative aspect-[4/5] overflow-hidden bg-gray-100 lg:col-span-1">
                <img 
                  src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop" 
                  alt="Abstract" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Abstract</h2>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Shop Now <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              <Link href="/collections/football-posters" className="group relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1580196969807-cc6de06c05ce?q=80&w=800&auto=format&fit=crop" 
                  alt="Vintage" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Vintage</h2>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Shop Now <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
