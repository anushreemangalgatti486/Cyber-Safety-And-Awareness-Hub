import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';

// Shared layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AlertToast from './components/AlertToast';
import CyberTicker from './components/CyberTicker';
import WarningModal from './components/WarningModal';

// Admin layout component
import AdminSidebar from './components/AdminSidebar';

// Public pages
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccessDenied from './pages/AccessDenied';

// User pages
import Home from './pages/Home';
import CyberAssistant from './pages/CyberAssistant';
import ScamDetection from './pages/ScamDetection';
import RepScanner from './pages/RepScanner';
import EvidenceScanner from './pages/EvidenceScanner';
import FraudReporting from './pages/FraudReporting';
import RealTimeAlerts from './pages/RealTimeAlerts';
import LearningHub from './pages/LearningHub';
import Profile from './pages/Profile';

// Admin pages (dedicated, separate from user pages)
import AdminHome from './pages/admin/AdminHome';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminBroadcast from './pages/admin/AdminBroadcast';
import AdminLogs from './pages/admin/AdminLogs';

// ─── User App Shell ────────────────────────────────────────────────────────────
function UserShell({ children }) {
  const { notifications, dismissNotification } = useSocket();
  const [modalNotif, setModalNotif] = useState(null);

  useEffect(() => {
    const critical = notifications.find(n => n.type === 'danger' || n.type === 'emergency');
    if (critical && !modalNotif) setModalNotif(critical);
  }, [notifications]); // eslint-disable-line

  return (
    <>
      <Navbar />
      <Sidebar />
      <AlertToast />
      <CyberTicker />
      <div className="pb-8">{children}</div>
      {modalNotif && (
        <WarningModal
          notification={modalNotif}
          onDismiss={() => { dismissNotification(modalNotif.id); setModalNotif(null); }}
        />
      )}
    </>
  );
}

// ─── Admin App Shell ───────────────────────────────────────────────────────────
function AdminShell({ children }) {
  const { alerts } = useSocket();
  return (
    <div className="flex min-h-screen bg-cyber-background">
      <AdminSidebar />
      {/* Main content area — offset by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <AlertToast />
        {children}
      </main>
    </div>
  );
}

// ─── Route Guards ──────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner color="cyber-primary" text="AUTHENTICATING..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <UserShell>{children}</UserShell>;
}

function RoleRoute({ children, allowedRoles, shell: Shell = React.Fragment }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner color="cyber-accent" text="VERIFYING CLEARANCE..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/access-denied" replace />;
  return <Shell>{children}</Shell>;
}

function Spinner({ color, text }) {
  return (
    <div className="min-h-screen bg-cyber-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className={`w-10 h-10 border-2 border-${color} border-t-transparent rounded-full animate-spin`} />
        <p className={`text-${color} text-xs font-mono tracking-widest`}>{text}</p>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public */}
            <Route path="/"             element={<Splash />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/admin/login"  element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* User routes */}
            <Route path="/home"           element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><Home /></RoleRoute>} />
            <Route path="/assistant"      element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><CyberAssistant /></RoleRoute>} />
            <Route path="/scam-detection" element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><ScamDetection /></RoleRoute>} />
            <Route path="/rep-scanner"    element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><RepScanner /></RoleRoute>} />
            <Route path="/evidence-scanner" element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><EvidenceScanner /></RoleRoute>} />
            <Route path="/report"         element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><FraudReporting /></RoleRoute>} />
            <Route path="/alerts"         element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><RealTimeAlerts /></RoleRoute>} />
            <Route path="/learning"       element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><LearningHub /></RoleRoute>} />
            <Route path="/profile"        element={<RoleRoute allowedRoles={['user', 'admin', 'superadmin']} shell={UserShell}><Profile /></RoleRoute>} />

            {/* Admin routes — all use AdminShell with AdminSidebar */}
            <Route path="/admin"              element={<RoleRoute allowedRoles={['admin', 'superadmin']} shell={AdminShell}><AdminHome /></RoleRoute>} />
            <Route path="/admin/reports"      element={<RoleRoute allowedRoles={['admin', 'superadmin']} shell={AdminShell}><AdminReports /></RoleRoute>} />
            <Route path="/admin/users"        element={<RoleRoute allowedRoles={['admin', 'superadmin']} shell={AdminShell}><AdminUsers /></RoleRoute>} />
            <Route path="/admin/analytics"    element={<RoleRoute allowedRoles={['admin', 'superadmin']} shell={AdminShell}><AdminAnalytics /></RoleRoute>} />
            <Route path="/admin/broadcast"    element={<RoleRoute allowedRoles={['admin', 'superadmin']} shell={AdminShell}><AdminBroadcast /></RoleRoute>} />
            <Route path="/admin/logs"         element={<RoleRoute allowedRoles={['admin', 'superadmin']} shell={AdminShell}><AdminLogs /></RoleRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
