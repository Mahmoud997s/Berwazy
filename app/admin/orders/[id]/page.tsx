"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Printer, Truck, MapPin, User, Package, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const orderId = parseInt(params.id);

  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const order = orders?.find(o => o.id === orderId);

  // Initialize form state once data is loaded
  useState(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || "");
      setInternalNotes(order.internalNotes || "");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/orders"] });
      toast({
        title: "Order Updated",
        description: "The order details have been successfully saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order details.",
        variant: "destructive",
      });
    }
  });

  if (isLoading || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ status, trackingNumber, internalNotes });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': 
      case 'refunded': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-12 print:bg-white print:text-black">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
        <div>
          <Button variant="ghost" asChild className="mb-4 -ml-4 uppercase tracking-widest text-[10px] text-muted-foreground hover:text-primary">
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Order #{order.id.toString().padStart(6, '0')}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            Placed on {format(new Date(order.createdAt), "MMMM do, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-widest text-xs">
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items List */}
          <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl print:border-none print:shadow-none print:bg-transparent">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 uppercase tracking-widest text-sm">
                <Package className="w-4 h-4 text-primary" />
                Purchased Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/30">
                    <tr>
                      <th className="px-6 py-4 font-bold">Product</th>
                      <th className="px-6 py-4 font-bold">Variant</th>
                      <th className="px-6 py-4 font-bold text-center">Qty</th>
                      <th className="px-6 py-4 font-bold text-right">Price</th>
                      <th className="px-6 py-4 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item: any) => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="px-6 py-4 font-bold">
                          {item.product?.title || "Unknown Product"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {item.variant?.size} • {item.variant?.material}
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                          EGP {(item.priceAtPurchase / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-black">
                          EGP {((item.priceAtPurchase * item.quantity) / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primary/5">
                      <td colSpan={4} className="px-6 py-4 text-right font-bold uppercase tracking-widest text-xs">Order Total</td>
                      <td className="px-6 py-4 text-right font-black text-lg text-primary">
                        EGP {(order.totalAmount / 100).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer Info & Admin Controls */}
        <div className="space-y-8">
          <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl print:border-none print:shadow-none print:bg-transparent">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-2 uppercase tracking-widest text-sm">
                <User className="w-4 h-4 text-primary" />
                Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="font-bold">{order.user?.name || "Guest"}</p>
                <p className="text-sm text-muted-foreground">{order.user?.email || "No email"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Shipping Address
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{order.shippingAddress || "No address provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Management Controls */}
          <Card className="border-2 border-primary/20 bg-primary/5 backdrop-blur-xl print:hidden">
            <CardHeader className="border-b border-primary/10 pb-4">
              <CardTitle className="uppercase tracking-widest text-sm text-primary">Order Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Order Status</label>
                <select
                  value={status || order.status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 uppercase tracking-widest text-xs font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Tracking Number
                </label>
                <Input
                  value={trackingNumber !== "" ? trackingNumber : (order.trackingNumber || "")}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking ID..."
                  className="bg-background/50 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Internal Notes (Staff Only)</label>
                <Textarea
                  value={internalNotes !== "" ? internalNotes : (order.internalNotes || "")}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add private notes about this order..."
                  className="bg-background/50 min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-background/20 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={updateMutation.isPending}
                className="w-full uppercase tracking-widest font-bold"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
