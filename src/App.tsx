// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import RootLayout from './layouts/RootLayout';
import UserLayout from './layouts/UserLayout';
import WriterLayout from './layouts/WriterLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Role-specific Dashboards
import UserDashboard from './pages/dashboard/UserDashboard';
import WriterDashboard from './pages/dashboard/WriterDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Shared Pages
import ArticlesPage from './pages/articles/AllArticlesPage';
import ArticleDetailPage from './pages/articles/ArticleDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import WalletPage from './pages/wallet/WalletPage';
import NotificationsPage from './pages/notification/NotificationPage';

// Writer Pages
import ArticleFormPage from './components/articles/ArticleForm';
import WriterRequestPage from './pages/promotion/WriterRequestPage';
import WriterArticlesPage from './pages/articles/WriterArticlePage';

// Admin Pages
import UsersManagementPage from './pages/admin/UsersManagementPage';
import ContentManagementPage from './pages/admin/ContentManagementPage';
import PendingApprovalsPage from './pages/admin/PendingApprovalPage';
import PromotionRequestsPage from './pages/admin/PromotionRequestPage';
import NotificationManagementPage from './pages/admin/NotificationManagementPage';
import WalletQRManagement from './components/admin/WalletQRManagement';
import PaymentRequests from './components/admin/PaymentRequest';
import { ErrorBoundary } from '@/components/admin/ErrorBoundary';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import WriterArticlePage from './pages/articles/WriterArticlePage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="admin/login" element={<AdminLoginPage />} />
              </Route>

              {/* User Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['user', 'writer', 'admin']}>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="articles/:slug" element={<ArticleDetailPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="promotion/request" element={<WriterRequestPage />} />
              </Route>

              {/* Writer Routes */}
              <Route
                path="/writer"
                element={
                  <ProtectedRoute allowedRoles={['writer']}>
                    <WriterLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<WriterDashboard />} />
                <Route path="articles/create" element={<ArticleFormPage mode="create" />} />
                <Route path="articles/edit/:slug" element={<ArticleFormPage mode="edit" />} />
                <Route path="articles" element={<WriterArticlePage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagementPage />} />
                <Route path="content" element={<ContentManagementPage />} />
                <Route path="approvals" element={<PendingApprovalsPage />} />
                <Route path="promotions" element={<PromotionRequestsPage />} />
                <Route path="notifications" element={<NotificationManagementPage />} />
                <Route
                  path="wallet-qr"
                  element={
                    <ErrorBoundary>
                      <WalletQRManagement />
                    </ErrorBoundary>
                  }
                />
                <Route path="payment-requests" element={<PaymentRequests />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Redirects */}
              <Route path="/writer" element={<Navigate to="/writer/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;