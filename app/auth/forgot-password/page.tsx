"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would call an API endpoint
      // const res = await fetch("/api/v1/auth/forgot-password", { ... });
      
      // Simulating a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSent(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for the reset password link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24 pb-20 px-4">
      <div className="w-full max-w-[450px] space-y-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Forgot Password</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            We'll send you a link to reset your password
          </p>
        </div>

        <Card className="border-2 rounded-none shadow-2xl bg-card">
          <CardContent className="pt-8 px-8 space-y-6">
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="uppercase tracking-widest font-bold text-[10px]">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="NAME@EXAMPLE.COM" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-none border-2 h-12 bg-transparent placeholder:text-muted-foreground/40"
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 uppercase tracking-widest font-black italic rounded-none mt-4 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending link..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="bg-primary/10 text-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ChevronLeft className="w-8 h-8 rotate-180" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">Link Sent!</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
                  If an account exists for {email}, you will receive a password reset link shortly.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full h-12 uppercase tracking-widest font-black italic rounded-none mt-6 text-xs border-2 hover:bg-muted"
                  asChild
                >
                  <Link href="/auth/signin">Back to Sign In</Link>
                </Button>
              </div>
            )}
          </CardContent>
          {!isSent && (
            <CardFooter className="flex flex-col space-y-4 border-t border-border mt-6 py-6 px-8">
              <Link 
                href="/auth/signin" 
                className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:text-primary transition-colors"
                draggable={false}
              >
                <ChevronLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
