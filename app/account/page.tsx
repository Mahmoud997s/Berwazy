"use client";

import { useState, useEffect } from "react";
import { User, Package, Settings, Heart, LogOut, Shield, Mail, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "orders" | "wishlist" | "settings";

export default function AccountPage() {
  const { user, logout, updateProfile, updatePassword, uploadAvatar, isUpdatingProfile, isUpdatingPassword, isUploadingAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const router = useRouter();
  const { toast } = useToast();

  // Settings state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
          Please sign in to view your account
        </p>
        <Button onClick={() => router.push("/auth/signin")} variant="outline" className="rounded-none uppercase font-bold italic tracking-tighter">
          Sign In Now
        </Button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email });
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePassword({ oldPassword, newPassword });
      toast({ title: "Success", description: "Password updated successfully" });
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await uploadAvatar(formData);
      toast({ title: "Success", description: "Profile picture updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center pt-24 md:pt-32 pb-24 px-4 bg-background/50">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-x-16 gap-y-12">
        {/* Sidebar */}
        <aside className="w-full space-y-8 lg:sticky lg:top-32 h-fit">
          <div className="flex items-center gap-4 border-b border-border/50 pb-8">
            <div className="relative group">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden border-2 border-border group-hover:border-primary transition-all shadow-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
                
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                </label>
              </div>
            </div>
            <div>
              <h2 className="font-black uppercase tracking-tighter text-xl italic">{user.name}</h2>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">Customer ID: #{user.id}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 p-4 rounded-none font-black uppercase italic tracking-tighter transition-all border-l-2 ${activeTab === "orders" ? "bg-muted border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              <Package className="w-4 h-4" /> Recent Orders
            </button>
            <Link 
              href="/wishlist"
              className="flex items-center gap-3 p-4 border-l-2 border-transparent hover:bg-muted/50 text-muted-foreground font-black uppercase italic tracking-tighter transition-all hover:text-foreground"
            >
              <Heart className="w-4 h-4" /> My Wishlist
            </Link>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 p-4 rounded-none font-black uppercase italic tracking-tighter transition-all border-l-2 ${activeTab === "settings" ? "bg-muted border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              <Settings className="w-4 h-4" /> Account Settings
            </button>
            <div className="pt-4 mt-4 border-t border-border/50">
              <button 
                onClick={() => logout()}
                className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 text-destructive font-black uppercase italic tracking-tighter transition-colors border-l-2 border-transparent"
              >
                <LogOut className="w-4 h-4" /> Secure Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[500px] flex flex-col items-center lg:items-start">
          <AnimatePresence mode="wait">
            {activeTab === "orders" && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-3xl space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter">My Orders</h1>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Track and manage your recent purchases</p>
                </div>
                
                <div className="bg-background border-2 border-border p-1">
                  <div className="border border-border/50 p-12 md:p-20 text-center bg-muted/10">
                    <Package className="w-16 h-16 mx-auto mb-6 opacity-20 text-primary" />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">No Orders Found</h3>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-8">You haven't placed any orders with us yet.</p>
                    <Button asChild variant="outline" className="rounded-none px-8 py-6 h-auto uppercase font-black italic tracking-tighter transition-all hover:bg-primary hover:text-primary-foreground border-2">
                      <Link href="/collections/football-posters">Explore Collections</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-3xl space-y-16"
              >
                <div className="space-y-10">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">Account Profile</h1>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Update your personal information and email</p>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid gap-8 bg-background border-2 border-border p-8 md:p-10 shadow-sm relative">
                      <div className="absolute -top-3 left-6 bg-background px-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Personal Details</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="s-name" className="text-[10px] uppercase tracking-widest font-black">Full Name</Label>
                          <Input 
                            id="s-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 px-4 bg-transparent border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors text-sm font-bold uppercase italic"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="s-email" className="text-[10px] uppercase tracking-widest font-black">Email Address</Label>
                          <Input 
                            id="s-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 px-4 bg-transparent border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors text-sm font-bold uppercase italic"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        disabled={isUpdatingProfile}
                        className="w-full md:w-fit px-10 h-12 rounded-none uppercase font-black italic tracking-tighter"
                      >
                        {isUpdatingProfile ? "Saving..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="space-y-10 pt-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Security & Password</h2>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Manage your password and account security</p>
                    </div>
                  </div>
                  
                  {!user.googleId ? (
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div className="grid gap-8 bg-background border-2 border-border p-8 md:p-10 shadow-sm relative">
                        <div className="absolute -top-3 left-6 bg-background px-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Credentials</div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-black">Current Password</Label>
                            <Input 
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="••••••••"
                              className="h-12 px-4 bg-transparent border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-black">New Password</Label>
                            <Input 
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="h-12 px-4 bg-transparent border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors"
                            />
                          </div>
                        </div>
                        
                        <Button 
                          disabled={isUpdatingPassword}
                          className="w-full md:w-fit px-10 h-12 rounded-none uppercase font-black italic tracking-tighter"
                        >
                          {isUpdatingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-8 border-2 border-border bg-muted/20 relative">
                      <div className="absolute -top-3 left-6 bg-background px-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Account Linked</div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold italic leading-relaxed">
                        Your account is currently linked with <span className="text-foreground">Google Authentication</span>. Password management is handled securely via your Google Account settings.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
