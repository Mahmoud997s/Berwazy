"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageSquare,
  Clock,
  Instagram,
  Twitter,
  Send,
  CheckCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const contactCards = [
  {
    icon: Mail,
    title: "Email Us",
    value: "info@brawezz.com",
    desc: "We'll get back to you within 24 hours",
    href: "mailto:info@brawezz.com",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    value: "Mon–Fri, 9am – 6pm",
    desc: "Instant help during business hours",
    href: "#",
  },
  {
    icon: Clock,
    title: "Response Time",
    value: "Under 24 Hours",
    desc: "Average first response time",
    href: null,
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
            Support · Contact
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-6">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Have a question about an order, need help choosing, or just want to
            talk art? We'd love to hear from you.
          </p>
        </motion.div>
      </section>

      {/* ─── Contact Info Cards ──────────────────────── */}
      <section className="py-16 md:py-24 bg-background">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="container mx-auto px-4 md:px-8 max-w-5xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contactCards.map((card) => {
              const Wrapper = card.href ? "a" : "div";
              return (
                <motion.div key={card.title} variants={fadeUp}>
                  <Wrapper
                    {...(card.href
                      ? { href: card.href, target: card.href.startsWith("mailto") ? undefined : "_blank" }
                      : {})}
                    className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 h-full"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      {card.title}
                    </p>
                    <p className="text-lg font-bold text-foreground mb-1 tracking-tight">
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {card.desc}
                    </p>
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ─── Contact Form + Sidebar ──────────────────── */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Send className="w-3.5 h-3.5" />
              Send a Message
            </div>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
              Drop Us a <span className="text-primary">Line</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* Form — spans 3 cols */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-3 p-8 md:p-10 rounded-2xl bg-background border border-border/50"
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Message Sent!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Thank you for reaching out. We'll get back to you within 24
                    hours.
                  </p>
                </div>
              ) : (
                <form
                  className="space-y-8"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-transparent border-b-2 border-border py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full bg-transparent border-b-2 border-border py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b-2 border-border py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                      placeholder="Order inquiry, feedback, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      className="w-full bg-transparent border-b-2 border-border py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest h-14 rounded-none transition-all duration-300"
                  >
                    Send Message <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Sidebar — spans 2 cols */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 space-y-6"
            >
              {/* Quick Links Card */}
              <div className="p-8 rounded-2xl bg-background border border-border/50 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Before You Reach Out
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You might find your answer in one of our support pages:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: "Shipping & Delivery",
                      href: "/support/shipping",
                    },
                    {
                      label: "Returns & Exchanges",
                      href: "/support/returns",
                    },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-all duration-300 text-sm font-semibold text-foreground"
                    >
                      {link.label}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Social Card */}
              <div className="p-8 rounded-2xl bg-background border border-border/50 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Follow Us
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Stay up to date with new drops, behind‑the‑scenes, and
                  exclusive offers.
                </p>
                <div className="flex gap-3">
                  {[
                    { icon: Instagram, href: "#", label: "Instagram" },
                    { icon: Twitter, href: "#", label: "Twitter" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="w-11 h-11 border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                    >
                      <social.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
