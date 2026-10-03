import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Navbar } from '../components/layout/Navbar';
import { AdminLayout } from '../components/layout/AdminLayout';

// Shopkeeper Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { BillingPage } from '../pages/BillingPage';
import { ProductsPage } from '../pages/ProductsPage';
import { StockPage } from '../pages/StockPage';
import { SalesHistoryPage } from '../pages/SalesHistoryPage';

// Admin Pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { CreateShopPage } from '../pages/admin/CreateShopPage';
import { ShopListPage } from '../pages/admin/ShopListPage';

/**
 * Protected wrapper for shopkeeper routes
 */
const ShopProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

/**
 * Protected wrapper for platform admin routes
 */
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAdminAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { isAuthenticated: isShopAuth } = useAuthStore();

  return (
    <Routes>
      {/* Public Shop Auth Routes */}
      <Route
        path="/login"
        element={isShopAuth ? <Navigate to="/billing" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isShopAuth ? <Navigate to="/billing" replace /> : <RegisterPage />}
      />

      {/* Protected Shopkeeper Routes */}
      <Route
        path="/billing"
        element={
          <ShopProtectedRoute>
            <BillingPage />
          </ShopProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ShopProtectedRoute>
            <ProductsPage />
          </ShopProtectedRoute>
        }
      />
      <Route
        path="/stock"
        element={
          <ShopProtectedRoute>
            <StockPage />
          </ShopProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ShopProtectedRoute>
            <SalesHistoryPage />
          </ShopProtectedRoute>
        }
      />

      {/* Admin Public Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Routes Branch */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="shops" element={<ShopListPage />} />
        <Route path="create-shop" element={<CreateShopPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/billing" replace />} />
      <Route path="*" element={<Navigate to="/billing" replace />} />
    </Routes>
  );
};
