"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, User, Filter, Ban, CheckCircle, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, top_buyers, blocked

  const { data: customers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/customers"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/customers", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await fetch(`/api/v1/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/customers"] });
      toast({ title: "Updated", description: "Customer status has been updated." });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredCustomers = customers?.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "blocked") return matchesSearch && !c.isActive;
    if (filterType === "top_buyers") return matchesSearch && c.orderCount > 0;
    return matchesSearch;
  }).sort((a, b) => {
    if (filterType === "top_buyers") return b.totalSpentCents - a.totalSpentCents;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) || [];

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !currentStatus } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Customer Management</h1>
        <p className="text-muted-foreground text-sm max-w-2xl uppercase tracking-widest">
          Monitor your users, analyze purchase behavior, and manage access.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 bg-background/50 border-2 focus:border-primary uppercase tracking-widest text-xs h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'All Users', icon: User },
            { id: 'top_buyers', label: 'Top Buyers', icon: ShieldAlert },
            { id: 'blocked', label: 'Blocked', icon: Ban },
          ].map((type) => (
            <Button
              key={type.id}
              variant={filterType === type.id ? "default" : "outline"}
              onClick={() => setFilterType(type.id)}
              className="uppercase tracking-widest text-[10px] font-bold h-10 px-4 whitespace-nowrap"
            >
              <type.icon className="w-3 h-3 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-6 py-5 font-black">Customer</th>
                  <th className="px-6 py-5 font-black">Joined</th>
                  <th className="px-6 py-5 font-black text-center">Orders</th>
                  <th className="px-6 py-5 font-black">Total Spent</th>
                  <th className="px-6 py-5 font-black">Status</th>
                  <th className="px-6 py-5 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground uppercase tracking-widest text-xs">
                      No matching customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary border-2 border-primary/20">
                            {c.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {c.name}
                              {c.role === 'admin' && <span className="bg-primary text-primary-foreground text-[8px] px-1 rounded">ADMIN</span>}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(c.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-center font-black">
                        {c.orderCount}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-primary">
                        EGP {(c.totalSpentCents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {c.isActive ? (
                          <div className="flex items-center gap-1 text-green-500 font-bold text-[10px] uppercase tracking-widest">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase tracking-widest">
                            <Ban className="w-3 h-3" />
                            Blocked
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title={c.isActive ? "Block User" : "Unblock User"}
                            onClick={() => handleToggleStatus(c.id, c.isActive)}
                            className={c.isActive ? "hover:text-red-500" : "hover:text-green-500"}
                          >
                            {c.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/orders?search=${c.email}`}>
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes Placeholder for modal/drawer later */}
      <div className="bg-primary/5 p-6 rounded-2xl border-2 border-dashed border-primary/20">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
          💡 Pro Tip: Filter by "Top Buyers" to identify your most loyal fans.
        </p>
      </div>
    </div>
  );
}
