/**
 * App.jsx — Main Application with Role-Based Routing
 * ====================================================
 * All routes are wrapped with ProtectedRoute for RBAC enforcement.
 * Login and AccessDenied are public routes.
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginScreen from './pages/LoginScreen';
import AccessDeniedScreen from './pages/AccessDeniedScreen';
import DashboardScreen from './pages/DashboardScreen';
import WorkersScreen from './pages/WorkersScreen';
import LiveMonitoringScreen from './pages/LiveMonitoringScreen';
import AnalyticsScreen from './pages/AnalyticsScreen';
import ViolationsLogScreen from './pages/ViolationsLogScreen';
import SettingsScreen from './pages/SettingsScreen';
import AddWorkerScreen from './pages/AddWorkerScreen';
import UserManagementScreen from './pages/UserManagementScreen';
import AdminSetupScreen from './pages/AdminSetupScreen';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

// ── Main App Component ─────────────────────────────────────
function App() {
  const { currentUser, userProfile, loading } = useAuth();

  // Global loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading SafeGuard AI...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login (and access-denied as reachable route)
  if (!currentUser || !userProfile) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated → show role-protected routes
  return (
    <>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/access-denied" element={<AccessDeniedScreen />} />
        <Route path="/setup-admin" element={<AdminSetupScreen />} />

        {/* Protected routes with RBAC */}
        <Route path="/" element={
          <ProtectedRoute requiredPermission="dashboard">
            <DashboardScreen />
          </ProtectedRoute>
        } />
        <Route path="/live" element={
          <ProtectedRoute requiredPermission="liveMonitoring">
            <LiveMonitoringScreen />
          </ProtectedRoute>
        } />
        <Route path="/workers" element={
          <ProtectedRoute requiredPermission="workerManagement">
            <WorkersScreen />
          </ProtectedRoute>
        } />
        <Route path="/add-worker" element={
          <ProtectedRoute requiredPermission="workerManagement">
            <AddWorkerScreen />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute requiredPermission="analyticsReports">
            <AnalyticsScreen />
          </ProtectedRoute>
        } />
        <Route path="/violations" element={
          <ProtectedRoute requiredPermission="violationLogs">
            <ViolationsLogScreen />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requiredPermission="systemSettings">
            <SettingsScreen />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute requiredPermission="userManagement">
            <UserManagementScreen />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast />
    </>
  );
}

export default App;
