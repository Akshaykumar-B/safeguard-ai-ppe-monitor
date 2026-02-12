/**
 * App.jsx — Main Application with Role-Based Routing
 * ====================================================
 * All routes are wrapped with ProtectedRoute for RBAC enforcement.
 * Login and AccessDenied are public routes.
 */

import { useState, useEffect } from 'react';
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

// ── FAQ Support Chat ───────────────────────────────────────
const FAQ_RESPONSES = {
  'how to add a worker': 'Navigate to Workers → Click "Add Worker" button in the top right. Fill in their name, ID, role, department, and upload face images for recognition.',
  'what is compliance rate': 'Compliance Rate measures what percentage of workers are currently wearing all required PPE for their zone. It\'s calculated in real-time from camera feeds.',
  'how to export data': 'You can export data from the Dashboard (Export Analytics Log button), Violations Log page, or Analytics page using the Export Report button. Data is exported as CSV.',
  'how does detection work': 'SafeGuard AI uses computer vision (OpenCV + YOLO) to detect PPE equipment on workers in real-time from CCTV feeds. It identifies helmets, vests, gloves, goggles, and more.',
  'what are zones': 'Zones are designated areas on your worksite with specific PPE requirements. You can configure zone rules in Settings → Site-Specific PPE Rules.',
  'how to configure alerts': 'Go to Settings → Detection Settings to adjust confidence thresholds and inference frequency. Alert severity is determined automatically based on violation type.',
  'user roles': 'There are 3 roles:\n• Admin — Full access, manages users & settings\n• Staff — Can monitor and acknowledge violations\n• Viewer — Read-only access to dashboards & reports',
  'default': 'I\'m SafeGuard AI Assistant! I can help with:\n• Adding/managing workers\n• Understanding compliance metrics\n• Configuring detection settings\n• Exporting reports\n• Zone & PPE rules\n• User roles & permissions\n\nTry asking about any of these topics!'
};

function SupportChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! 👋 I\'m your SafeGuard AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let response = FAQ_RESPONSES.default;
      for (const [key, val] of Object.entries(FAQ_RESPONSES)) {
        if (key !== 'default' && lower.includes(key.split(' ').slice(0, 2).join(' '))) {
          response = val;
          break;
        }
      }
      setMessages(prev => [...prev, { from: 'bot', text: response }]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-8 w-96 max-h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-[60] overflow-hidden"
      style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="bg-primary p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="material-icons text-white text-sm">smart_toy</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">SafeGuard Assistant</h3>
            <p className="text-white/60 text-[10px]">Online • Avg. response &lt; 1s</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[320px] custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${msg.from === 'user'
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={handleSend} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors">
          <span className="material-icons text-lg">send</span>
        </button>
      </div>
    </div>
  );
}

// ── Main App Component ─────────────────────────────────────
function App() {
  const [chatOpen, setChatOpen] = useState(false);
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
      <SupportChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Support Chat FAB */}
      <button
        onClick={() => setChatOpen(prev => !prev)}
        className={`fixed bottom-8 right-8 w-14 h-14 rounded-2xl shadow-[0_10px_30px_rgba(17,115,212,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group ${chatOpen ? 'bg-rose-500' : 'bg-primary'} text-white`}
      >
        <span className="material-icons group-hover:rotate-12 transition-transform">
          {chatOpen ? 'close' : 'support_agent'}
        </span>
      </button>
    </>
  );
}

export default App;
