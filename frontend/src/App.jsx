import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLoader } from './components/ui/Skeleton';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import DebtsPage from './pages/DebtsPage';

// Lazy loaded pages for performance optimization
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const LogoPlayground = lazy(() => import('./pages/LogoPlayground'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <AppLoader />;

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/logo" element={<LogoPlayground />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/debts" element={<DebtsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-j-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-j-negative-dim rounded-full flex items-center justify-center text-j-negative mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-xl font-heading font-bold text-j-ink mb-2">Something went wrong</h1>
          <p className="text-sm text-j-ink-3 mb-6 max-w-sm">The app encountered an unexpected error. Please try refreshing.</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-j-surface border border-j-border rounded-sm text-sm font-medium text-j-ink hover:bg-j-surface-raised transition-colors">
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TransactionProvider>
            <ThemeProvider>
              <ErrorBoundary>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: 'var(--j-surface)',
                      color: 'var(--j-ink)',
                      border: '1px solid var(--j-border)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      padding: '10px 14px',
                    },
                    success: {
                      iconTheme: { primary: '#1E6B4A', secondary: '#FAFAFA' },
                    },
                    error: {
                      iconTheme: { primary: '#8B2020', secondary: '#FAFAFA' },
                    },
                  }}
                />
              </ErrorBoundary>
            </ThemeProvider>
          </TransactionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
