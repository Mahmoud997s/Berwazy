"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export function GoogleAuthButton() {
  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/google`;
  };

  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-3 h-12 uppercase tracking-widest font-bold text-xs border-2 hover:bg-muted transition-colors"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="w-5 h-5" />
      Sign in with Google
    </Button>
  );
}
