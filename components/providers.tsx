"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UiProvider } from "@/components/ui-context";
import { CartDrawer } from "@/components/cart-drawer";
import { ReactNode } from "react";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <UiProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <CartDrawer />
          </TooltipProvider>
        </UiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
