"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, TicketPercent, Plus, Trash2, Save, Calendar, Percent, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  // --- Coupon Data ---
  const { data: coupons, isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/coupons"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/coupons", { credentials: "include" });
      return res.json();
    }
  });

  const saveCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/v1/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/coupons"] });
      toast({ title: "Success", description: "Coupon saved." });
      setIsAdding(false);
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/v1/admin/coupons/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/coupons"] });
      toast({ title: "Deleted", description: "Coupon removed." });
    }
  });

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Coupons & Offers</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Drive sales with promo codes and discount rules.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="uppercase tracking-widest text-xs font-bold gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {(isAdding) && (
        <Card className="border-2 border-primary/20 bg-primary/5 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest">New Promo Code</CardTitle>
          </CardHeader>
          <CardContent>
             <form className="grid grid-cols-1 md:grid-cols-4 gap-6" onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               saveCouponMutation.mutate({
                 code: formData.get("code"),
                 discountType: formData.get("discountType"),
                 discountValue: parseInt(formData.get("value") as string) * (formData.get("discountType") === 'percentage' ? 1 : 100),
                 minOrderAmount: parseInt(formData.get("minOrder") as string) * 100,
                 expiresAt: formData.get("expiry") ? new Date(formData.get("expiry") as string) : null,
                 isActive: true
               });
             }}>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-muted-foreground">Promo Code</label>
                 <Input name="code" placeholder="SAVE20" required className="font-black uppercase tracking-widest" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-muted-foreground">Type</label>
                 <select name="discountType" className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-bold uppercase tracking-widest">
                   <option value="percentage">Percentage (%)</option>
                   <option value="fixed">Fixed (EGP)</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-muted-foreground">Value</label>
                 <Input name="value" type="number" placeholder="20" required className="font-bold" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-muted-foreground">Min Order (EGP)</label>
                 <Input name="minOrder" type="number" placeholder="500" defaultValue="0" className="font-bold" />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] uppercase font-bold text-muted-foreground">Expires At</label>
                 <Input name="expiry" type="date" className="font-bold" />
               </div>
               <div className="md:col-span-4 flex justify-end gap-2 pt-4">
                 <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button type="submit" disabled={saveCouponMutation.isPending}>
                   {saveCouponMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                   Save Coupon
                 </Button>
               </div>
             </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-6 py-5 font-black">Code</th>
                  <th className="px-6 py-5 font-black">Discount</th>
                  <th className="px-6 py-5 font-black">Requirements</th>
                  <th className="px-6 py-5 font-black">Expiry</th>
                  <th className="px-6 py-5 font-black">Status</th>
                  <th className="px-6 py-5 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {coupons?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground uppercase tracking-widest text-xs">
                      No active coupons. Create one to get started.
                    </td>
                  </tr>
                ) : (
                Array.isArray(coupons) && coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <TicketPercent className="w-5 h-5 text-primary" />
                          <span className="font-black text-lg tracking-wider">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.discountType === 'percentage' ? (
                          <div className="flex items-center gap-1 font-black text-primary">
                            {coupon.discountValue}% OFF
                            <Percent className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 font-black text-primary">
                            EGP {(coupon.discountValue / 100).toFixed(2)} OFF
                            <Banknote className="w-3 h-3" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {coupon.minOrderAmount > 0 ? (
                          <span className="text-muted-foreground">Min order: <span className="text-foreground font-bold">EGP {(coupon.minOrderAmount / 100).toFixed(0)}</span></span>
                        ) : (
                          <span className="text-muted-foreground">No minimum</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Forever"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${coupon.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteCouponMutation.mutate(coupon.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
