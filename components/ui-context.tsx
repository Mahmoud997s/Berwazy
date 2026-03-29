import React, { createContext, useContext, useState, ReactNode } from "react";

interface UiContextType {
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export function UiProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <UiContext.Provider value={{ isCartOpen, setCartOpen }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useUi must be used within a UiProvider");
  }
  return context;
}
