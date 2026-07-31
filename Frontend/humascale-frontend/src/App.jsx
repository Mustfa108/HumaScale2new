import { Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute, GuestRoute } from './components/layout/ProtectedRoute';
import { FullPageSpinner } from './components/ui/Spinner';
import { useAuth } from './contexts/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Public
import Landing from './pages/Landing';

// User pages
import Dashboard from './pages/user/Dashboard';
import Assessment from './pages/user/Assessment';
import AssessmentResults from './pages/user/AssessmentResults';
import History from './pages/user/History';
import Profile from './pages/user/Profile';
import Notifications from './pages/user/Notifications';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAssessments from './pages/admin/AdminAssessments';
import AdminAssessmentDetail from './pages/admin/AdminAssessmentDetail';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <p className="text-lg text-slate-600">الصفحة غير موجودة</p>
      <a
        href="/"
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        العودة للرئيسية
      </a>
    </div>
  );
}

function RootRedirect() {
  const { user, admin, bootstrapping } = useAuth();
  if (bootstrapping) return <FullPageSpinner />;
  if (admin) return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

export default function App() {
  return (
    <Routes>
      {/* Public root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth (guests only) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/verify-email/:id/:hash" element={<VerifyEmail />} />

      {/* User app (protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment"
        element={
          <ProtectedRoute>
            <Assessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment/:id/results"
        element={
          <ProtectedRoute>
            <AssessmentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Admin (protected with requireAdmin) */}
      <Route
        path="/admin/login"
        element={
          <GuestRoute>
            <AdminLogin />
          </GuestRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assessments"
        element={
          <ProtectedRoute requireAdmin>
            <AdminAssessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assessments/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminAssessmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requireAdmin>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
