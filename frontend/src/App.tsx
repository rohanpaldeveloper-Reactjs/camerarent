import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useAuthStore } from './store/authStore';
import { useCmsStore } from './store/cmsStore';
import { useSEO } from './utils/useSEO';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';

// Lazy loaded page components
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Policies = lazy(() => import('./pages/Policies'));
const Faq = lazy(() => import('./pages/Faq'));
const VendorOnboarding = lazy(() => import('./pages/VendorOnboarding'));
const About = lazy(() => import('./pages/About'));

// Simple loading indicator fallback for Suspense
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  );
}

// Protected Route for Customer / general authenticated users
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { token, refreshProfile } = useAuthStore();
  const { fetchCms } = useCmsStore();

  useSEO();

  // Automatically refresh profile on app startup if token exists
  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token, refreshProfile]);

  useEffect(() => {
    fetchCms();
  }, [fetchCms]);

  return (
    <BrowserRouter>
      <div className="min-h-screen gradient-bg flex flex-col">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 pb-16">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/products/:slug" element={<ProductDetail />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Static Resource Pages */}
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
              <Route path="/about" element={<About />} />

              {/* Protected Customer Routes */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
