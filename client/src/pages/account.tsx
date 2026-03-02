import { Layout } from "@/components/layout";
import { User, Package, Settings, Heart, LogOut } from "lucide-react";

export default function Account() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div className="flex items-center gap-4 border-b border-border pb-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Guest User</h2>
                <p className="text-sm text-muted-foreground">Mock Account</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <a href="#" className="flex items-center gap-3 p-3 bg-muted rounded-lg font-medium text-primary">
                <Package className="w-5 h-5" /> Orders
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-5 h-5" /> Wishlist
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                <Settings className="w-5 h-5" /> Settings
              </a>
              <a href="#" className="flex items-center gap-3 p-3 hover:bg-destructive/10 text-destructive rounded-lg transition-colors mt-auto">
                <LogOut className="w-5 h-5" /> Logout
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            <h1 className="text-3xl font-display font-bold">Recent Orders</h1>
            
            <div className="bg-background border border-border rounded-xl overflow-hidden">
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">You haven't placed any orders yet.</p>
                <a href="/collections/all" className="inline-block mt-4 text-foreground font-medium underline hover:text-primary/70">
                  Start shopping
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
