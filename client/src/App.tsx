import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UiProvider } from "@/components/ui-context";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Collection from "@/pages/collection";
import Product from "@/pages/product";
import Search from "@/pages/search";
import Checkout from "@/pages/checkout";
import Account from "@/pages/account";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/collections/:slug" component={Collection} />
      <Route path="/product/:slug" component={Product} />
      <Route path="/search" component={Search} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/account" component={Account} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UiProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UiProvider>
    </QueryClientProvider>
  );
}

export default App;
