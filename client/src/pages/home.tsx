import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden"
      >
        {/* landing page hero modern gallery aesthetic */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=2000&auto=format&fit=crop" 
            alt="Gallery Wall Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto space-y-8">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight"
          >
            Curate Your Space.
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-2xl font-medium text-white/90 max-w-2xl mx-auto"
          >
            Premium fine art prints and football posters designed to elevate your environment.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link 
              href="/collections/football-posters"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/90 transition-transform hover:scale-105"
            >
              Shop Football Collection <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Featured Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover our most popular collections. Hand-picked designs tailored to your aesthetic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Football Legends", url: "/collections/football-posters", img: "https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=800&auto=format&fit=crop" },
            { title: "Abstract Flow", url: "/collections/abstract", img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop" },
            { title: "Vintage Classics", url: "/collections/vintage", img: "https://images.unsplash.com/photo-1580196969807-cc6de06c05ce?q=80&w=800&auto=format&fit=crop" },
          ].map((cat, i) => (
            <Link key={i} href={cat.url} className="group relative aspect-[4/5] overflow-hidden rounded-2xl block">
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full flex items-end justify-between">
                <h3 className="text-white text-2xl font-display font-bold">{cat.title}</h3>
                <span className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors group-hover:bg-white group-hover:text-black">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
