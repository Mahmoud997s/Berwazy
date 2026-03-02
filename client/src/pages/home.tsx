import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col pt-[calc(20px+5rem)]">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black -mt-[calc(20px+5rem)]">
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
    </div>
  );
}
