"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24 pb-20 px-4">
      <div className="w-full max-w-[450px] space-y-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Sign In</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Enter your details to access your account
          </p>
        </div>

        <Card className="border-2 rounded-none shadow-2xl bg-card">
          <CardContent className="pt-8 px-8 space-y-6">
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="uppercase tracking-widest font-bold text-[10px]">Password</Label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none border-2 h-12 bg-transparent"
                  required 
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 uppercase tracking-widest font-black italic rounded-none mt-4 text-sm"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <GoogleAuthButton />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-border mt-6 py-6 px-8">
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 transition-colors">
                Register Now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
