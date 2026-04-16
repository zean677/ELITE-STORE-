import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n";
import { CurrencyProvider } from "@/hooks/use-currency";
import { AuthProvider } from "@/hooks/use-auth";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { BottomNavigation } from "@/components/BottomNavigation";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Dashboard from "@/pages/Dashboard";
import WalletPage from "@/pages/WalletPage";
import Deposit from "@/pages/Deposit";
import Orders from "@/pages/Orders";
import OrderResult from "@/pages/OrderResult";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Support from "@/pages/Support";
import Terms from "@/pages/Terms";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminCategories from "@/pages/admin/AdminCategories";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/deposit" component={Deposit} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id/success" component={OrderResult} />
      <Route path="/orders/:id/failed" component={OrderResult} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/profile" component={Profile} />
      <Route path="/support" component={Support} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Terms} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CurrencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                <AnnouncementBanner />
                <Router />
                <BottomNavigation />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
