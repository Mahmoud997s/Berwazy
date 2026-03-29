"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Package, 
  Users, 
  TrendingUp, 
  ShoppingCart, 
  Clock, 
  AlertCircle,
  Eye,
  Star,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/admin/stats", { credentials: "include" })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const mainStats = [
    { title: "Total Sales", value: stats ? `$${(stats.totalSalesCents / 100).toLocaleString()}` : "—", sub: `${stats?.deliveredOrders || 0} Delivered`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Visitors", value: stats?.visitors ?? "—", sub: "Active sessions", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Pending Orders", value: stats?.pendingOrders ?? "—", sub: "Needs attention", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Abandoned Carts", value: stats?.abandonedCarts ?? "—", sub: "Last 2 hours", icon: ShoppingCart, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live System
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -mr-8 -mt-8 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <Card className="lg:col-span-2 border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              TOP SELLING PRODUCTS
            </CardTitle>
            <CardDescription>Based on recent order volume</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product: any, idx: number) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        #{idx + 1}
                      </div>
                      <span className="font-bold text-sm truncate max-w-[200px]">{product.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase uppercase">Sold</span>
                      <span className="text-lg font-bold text-primary">{product.totalSold}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground italic">No sales data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Inventory */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              NOTIFICATIONS
            </CardTitle>
            <CardDescription>Critical updates & alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.alerts?.length > 0 ? (
                stats.alerts.map((alert: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span className="text-sm font-medium text-foreground/80 leading-tight">{alert}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <Star className="w-8 h-8 text-primary/30" />
                  <p className="text-sm text-muted-foreground italic">System healthy. No alerts.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Products", value: stats?.products, icon: Package, link: "/admin/products" },
          { label: "Customers", value: stats?.users, icon: Users, link: "/admin/customers" },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex flex-col items-center justify-center text-center gap-1">
             <item.icon className="w-5 h-5 text-muted-foreground mb-1" />
             <span className="text-lg font-black">{item.value ?? 0}</span>
             <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
