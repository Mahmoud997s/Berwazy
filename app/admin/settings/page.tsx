"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Truck, CreditCard, Store, Plus, Trash2, Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("shipping");

  // --- Shipping Rates Data ---
  const { data: rates, isLoading: ratesLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/shipping-rates"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/shipping-rates", { credentials: "include" });
      return res.json();
    }
  });

  const saveRateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/v1/admin/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/shipping-rates"] });
      toast({ title: "Saved", description: "Shipping rate updated." });
    }
  });

  const deleteRateMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/v1/admin/shipping-rates/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/shipping-rates"] });
      toast({ title: "Deleted", description: "Region removed." });
    }
  });

  // --- Store Settings Data ---
  const { data: settings, isLoading: settingsLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/settings", { credentials: "include" });
      return res.json();
    }
  });

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/settings"] });
      toast({ title: "Settings Updated", description: "Change saved successfully." });
    }
  });

  if (ratesLoading || settingsLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const getSetting = (key: string) => (Array.isArray(settings) ? settings.find(s => s.key === key)?.value : "") || "";

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Store Configuration</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">Global settings for shipping, payments, and policy.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/40 border-2 border-border/50 p-1 rounded-xl h-14">
          <TabsTrigger value="shipping" className="rounded-lg px-8 py-2 uppercase tracking-widest text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Truck className="w-4 h-4 mr-2" /> Shipping
          </TabsTrigger>
          <TabsTrigger value="payment" className="rounded-lg px-8 py-2 uppercase tracking-widest text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <CreditCard className="w-4 h-4 mr-2" /> Payment
          </TabsTrigger>
          <TabsTrigger value="general" className="rounded-lg px-8 py-2 uppercase tracking-widest text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Store className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipping" className="space-y-6">
          <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase tracking-widest text-sm">
                <Truck className="w-4 h-4 text-primary" /> Shipping Regions & Rates
              </CardTitle>
              <CardDescription>Set delivery costs and estimated times for different locations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(rates) && rates.map((rate) => (
                  <div key={rate.id} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-background/50 border border-border/50 items-center">
                    <Input 
                      placeholder="Region Name" 
                      defaultValue={rate.region} 
                      onBlur={(e) => saveRateMutation.mutate({ ...rate, region: e.target.value })}
                      className="flex-1 font-bold uppercase tracking-widest text-xs h-10"
                    />
                    <div className="flex items-center gap-2 w-full md:w-[150px]">
                      <span className="text-xs font-bold text-muted-foreground">EGP</span>
                      <Input 
                        type="number" 
                        defaultValue={rate.priceCents / 100} 
                        onBlur={(e) => saveRateMutation.mutate({ ...rate, priceCents: parseFloat(e.target.value) * 100 })}
                        className="h-10 font-mono"
                      />
                    </div>
                    <Input 
                      placeholder="Estimated Days (e.g. 2-5 days)" 
                      defaultValue={rate.estimatedDays} 
                      onBlur={(e) => saveRateMutation.mutate({ ...rate, estimatedDays: e.target.value })}
                      className="flex-1 text-xs h-10"
                    />
                    <div className="flex items-center gap-4 px-2">
                       <Switch 
                         checked={rate.isActive} 
                         onCheckedChange={(val) => saveRateMutation.mutate({ ...rate, isActive: val })} 
                       />
                       <Button variant="ghost" size="icon" onClick={() => deleteRateMutation.mutate(rate.id)} className="text-red-500 hover:bg-red-500/10">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-dashed border-2 py-8 hover:bg-primary/5 uppercase tracking-widest text-[10px] font-bold" onClick={() => saveRateMutation.mutate({ region: "New Region", priceCents: 5000, isActive: true })}>
                  <Plus className="w-4 h-4 mr-2" /> Add New Region
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest">Stripe Gateway</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-muted-foreground">Enable Stripe</span>
                  <Switch 
                     checked={getSetting("stripe_enabled") === "true"} 
                     onCheckedChange={(val) => saveSettingMutation.mutate({ key: "stripe_enabled", value: val.toString() })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Secret Key</label>
                  <Input 
                    type="password" 
                    defaultValue={getSetting("stripe_secret_key")} 
                    className="font-mono text-xs"
                    onBlur={(e) => saveSettingMutation.mutate({ key: "stripe_secret_key", value: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest">Cash on Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-muted-foreground">Enable COD</span>
                  <Switch 
                     checked={getSetting("cod_enabled") === "true"} 
                     onCheckedChange={(val) => saveSettingMutation.mutate({ key: "cod_enabled", value: val.toString() })} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                Store Rules & Logic
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest">Global parameters for checkout and pricing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Tax Percentage (%)</label>
                  <Input 
                    type="number" 
                    defaultValue={getSetting("tax_pct") || "0"} 
                    onBlur={(e) => saveSettingMutation.mutate({ key: "tax_pct", value: e.target.value })}
                    className="h-10 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Free Shipping Above (EGP)</label>
                  <Input 
                    type="number" 
                    defaultValue={getSetting("free_shipping_min") || "0"} 
                    onBlur={(e) => saveSettingMutation.mutate({ key: "free_shipping_min", value: e.target.value })}
                    className="h-10 font-bold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
