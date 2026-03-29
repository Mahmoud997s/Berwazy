"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: delay },
  }),
};

const child = {
  visible: {
    opacity: 1,
    display: "inline-block",
  },
  hidden: {
    opacity: 0,
    display: "none",
  },
};

export default function AdminLoadingPage() {
  const router = useRouter();

  const text1 = "WELCOME TO YOUR ADMIN DASHBOARD";
  const text2 = "FEEL FREE TO CUSTOMIZE YOUR STORE";

  useEffect(() => {
    // Redirect after 2 seconds
    const timeoutId = setTimeout(() => {
      router.replace("/admin");
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10"
      />

      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl px-6">
        {/* Animated Custom Spinner */}
        <div className="relative w-20 h-20 mb-8">
          <motion.div
            className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-accent border-l-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-t-transparent border-r-primary border-b-transparent border-l-accent rounded-full opacity-70"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Typewriter Text */}
        <div className="space-y-4 min-h-[100px] font-sans">
          <motion.h1
            variants={container}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-widest text-primary drop-shadow-sm flex flex-wrap justify-center gap-x-4"
          >
            {text1.split(" ").map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {Array.from(word).map((char, charIndex) => (
                  <motion.span variants={child} key={charIndex}>
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>
          
          <motion.p
            variants={container}
            initial="hidden"
            animate="visible"
            custom={1.0}
            className="text-lg md:text-2xl font-light tracking-widest text-muted-foreground uppercase opacity-80 flex flex-wrap justify-center gap-x-3"
          >
            {text2.split(" ").map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {Array.from(word).map((char, charIndex) => (
                  <motion.span variants={child} key={charIndex}>
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-xs tracking-[0.2em] text-muted-foreground uppercase absolute bottom-12"
        >
          Initializing environment...
        </motion.div>
      </div>
    </div>
  );
}
