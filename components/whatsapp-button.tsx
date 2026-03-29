"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
}

export function WhatsAppButton({ phoneNumber, message, className }: WhatsAppButtonProps) {
  if (!phoneNumber) return null;

  const encodedMessage = encodeURIComponent(message || "Hi, I have a question about your products.");
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodedMessage}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 2 // Show after a short delay
      }}
      className={cn("fixed bottom-8 left-8 z-50", className)}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 bg-background border-2 border-border px-4 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Contact us!</p>
        </div>

        {/* Main Button */}
        <div className="relative w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all duration-300">
          <MessageCircle className="w-7 h-7 fill-current" />
        </div>

        {/* Pulsing Ring */}
        <div className="absolute inset-0 border-4 border-[#25D366] rounded-full animate-ping opacity-20" />
      </a>
    </motion.div>
  );
}
