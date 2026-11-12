import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserLayout } from "@/components/user/UserLayout";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import IndianCuisinePage from "./pages/IndianCuisinePage";
import AuthPage from "./pages/AuthPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/indian" element={<IndianCuisinePage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* User protected routes - require authentication */}
              <Route path="/cart" element={
                <ProtectedRoute requireAuth>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute requireAuth>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute requireAuth>
                  <UserLayout>
                    <ProfilePage />
                  </UserLayout>
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute requireAuth>
                  <UserLayout>
                    <FavoritesPage />
                  </UserLayout>
                </ProtectedRoute>
              } />
              <Route path="/track-order" element={
                <ProtectedRoute requireAuth>
                  <UserLayout>
                    <OrderTrackingPage />
                  </UserLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin protected routes - require admin role */}
              <Route path="/admin" element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/menu" element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminMenu />
                </ProtectedRoute>
              } />
              <Route path="/admin/customers" element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminCustomers />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
