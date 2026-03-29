"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  Package,
  Search,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const deliveryZones = [
  {
    icon: MapPin,
    region: "Europe",
    time: "3–7 business days",
    highlight: true,
  },
  {
    icon: Globe,
    region: "North America",
    time: "5–10 business days",
    highlight: false,
  },
  {
    icon: Globe,
    region: "Rest of World",
    time: "7–14 business days",
    highlight: false,
  },
];

export default function ShippingPage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,90,0,0.08),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 md:px-8 relative z-10 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-6">
            Support · Shipping
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-6">
            Shipping <span className="text-primary">&</span> Delivery
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Every poster is printed to order for the highest quality. Here's
            everything you need to know about getting it to your door.
          </p>
        </motion.div>
      </section>

      {/* ─── Production + Free Shipping — Two Cards ──── */}
      <section className="py-16 md:py-24 bg-background">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="container mx-auto px-4 md:px-8 max-w-5xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Production Card */}
            <motion.div
              variants={fadeUp}
              className="relative group p-8 md:p-10 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">
                Made to Order
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Each BRAWEZZ. poster is carefully printed on demand. Please allow{" "}
                <span className="text-primary font-semibold">
                  1–3 business days
                </span>{" "}
                for production before your order ships.
              </p>
            </motion.div>

            {/* Free Shipping Card */}
            <motion.div
              variants={fadeUp}
              className="relative group p-8 md:p-10 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">
                Shipping Costs
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                We offer{" "}
                <span className="text-primary font-semibold">
                  FREE Worldwide Shipping
                </span>{" "}
                on all orders over €100. Under that, a flat rate is calculated at
                checkout based on your location.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Delivery Zones ──────────────────────────── */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Truck className="w-3.5 h-3.5" />
              Delivery Estimates
            </div>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
              Where We <span className="text-primary">Ship</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {deliveryZones.map((zone) => (
              <motion.div
                key={zone.region}
                variants={fadeUp}
                className="group relative p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-500 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <zone.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">
                  {zone.region}
                </h3>
                <p className="text-2xl font-black text-primary tracking-tight mb-1">
                  {zone.time.split(" ")[0]}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                  Business Days
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Order Tracking ──────────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
          >
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground">
                Track Your <span className="text-primary">Order</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                Once your order ships, you'll receive a confirmation email with a
                tracking number and live link to follow your package's journey —
                right to your doorstep.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="relative p-8 md:p-10 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <div className="space-y-5">
                {[
                  {
                    icon: Package,
                    label: "Order Confirmed",
                    desc: "Your poster enters production",
                  },
                  {
                    icon: Truck,
                    label: "Shipped",
                    desc: "Tracking email sent to you",
                  },
                  {
                    icon: MapPin,
                    label: "Delivered",
                    desc: "Art arrives at your door",
                  },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <item.icon className="w-5 h-5" />
                      </div>
                      {i < 2 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-5 bg-border" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border bg-background/60 text-xs font-semibold text-muted-foreground">
              <Mail className="w-3.5 h-3.5 text-primary" />
              We typically respond within 24 hours
            </div>

            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground">
              Have a shipping <span className="text-primary">question?</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Can't find what you're looking for? Our support team is happy to
              help with any shipping or delivery inquiries.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300"
              >
                <Link href="/support/contact">
                  Contact Us <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-background font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300"
              >
                <Link href="/support/returns">Returns & Exchanges</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
