"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Package, Truck, CheckCircle, ShieldCheck, RefreshCw, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const steps = [
  {
    number: "01",
    icon: Mail,
    title: "Contact Us",
    description: "Reach out to our support team with your order number and reason for return.",
  },
  {
    number: "02",
    icon: Package,
    title: "Pack Securely",
    description: "We'll send you a return label. Pack items in their original packaging.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Ship It Back",
    description: "Drop off your package at the nearest courier point using the prepaid label.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Get Refunded",
    description: "Once received, your refund is processed within 5–7 business days.",
  },
];

export default function ReturnsPage() {
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
            Support · Returns
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-6">
            Returns <span className="text-primary">&</span> Exchanges
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Not 100% happy with your order? No worries. We make returns simple, 
            fast, and completely hassle‑free.
          </p>
        </motion.div>
      </section>

      {/* ─── Guarantee + Damaged — Two Cards ──────────── */}
      <section className="py-16 md:py-24 bg-background">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="container mx-auto px-4 md:px-8 max-w-5xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guarantee Card */}
            <motion.div
              variants={fadeUp}
              className="relative group p-8 md:p-10 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">
                30-Day Money Back Guarantee
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                We want you to love your art. If you're not completely satisfied, 
                return your items within{" "}
                <span className="text-primary font-semibold">30 days</span> of 
                delivery for a full refund or exchange — no questions asked.
              </p>
            </motion.div>

            {/* Damaged Items Card */}
            <motion.div
              variants={fadeUp}
              className="relative group p-8 md:p-10 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">
                Damaged on Arrival?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                In the unlikely event your order arrives damaged, snap a photo and 
                contact us immediately. We'll ship a{" "}
                <span className="text-primary font-semibold">free replacement</span>{" "}
                — no return needed.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── How to Return — Steps ───────────────────── */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <RefreshCw className="w-3.5 h-3.5" />
              Simple Process
            </div>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
              How to <span className="text-primary">Return</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="group relative p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-500"
              >
                {/* Step Number */}
                <span className="absolute top-5 right-5 text-[10px] font-black text-muted-foreground/30 tracking-widest">
                  {step.number}
                </span>

                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                  <step.icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Refund + CTA ────────────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Refund Note */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border bg-card/60 text-xs font-semibold text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
              Refunds are processed within 5–7 business days of receiving your return
            </div>

            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground">
              Still have <span className="text-primary">questions?</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Our support team is here to help. Reach out anytime and we'll get 
              back to you within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300"
              >
                <Link href="/support/contact">
                  Contact Support <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-card font-bold uppercase tracking-widest px-10 h-14 rounded-none transition-all duration-300"
              >
                <Link href="/support/shipping">Shipping Info</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
