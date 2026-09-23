import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ConsumerVerify from './pages/ConsumerVerify';
import BeekeeperDashboard from './pages/BeekeeperDashboard';
import Apiaries from './pages/Apiaries';
import Hives from './pages/Hives';
import HiveDetail from './pages/HiveDetail';
import Batches from './pages/Batches';
import CreateBatch from './pages/CreateBatch';
import BatchTraceability from './pages/BatchTraceability';
import QRGenerator from './pages/QRGenerator';
import AdminDashboard from './pages/AdminDashboard';
import Alerts from './pages/Alerts';
import About from './pages/About';
import AuditLog from './pages/AuditLog';
import HiveCompare from './pages/HiveCompare';
import VirtualKeyboard from './components/VirtualKeyboard';

function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const auth = useAuth();

    return (
    <>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing user={auth.user} />} />
      <Route path="/about" element={<About />} />
      <Route path="/verify/:batchId" element={<ConsumerVerify />} />
      <Route path="/login" element={<Login onLogin={auth.login} />} />
      <Route path="/register" element={<Register onLogin={auth.login} />} />

      {/* Beekeeper */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <BeekeeperDashboard user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apiaries"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <Apiaries user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hives"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <Hives user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hives/compare"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <HiveCompare user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hives/:id"
        element={
          <ProtectedRoute user={auth.user}>
            <HiveDetail user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <Batches user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches/new"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <CreateBatch user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches/:batchId/traceability"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <BatchTraceability user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches/:batchId/qr"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <QRGenerator user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/alerts"
        element={
          <ProtectedRoute user={auth.user} role="beekeeper">
            <Alerts user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={auth.user} role="admin">
            <AdminDashboard user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <ProtectedRoute user={auth.user} role="admin">
            <AuditLog user={auth.user} onLogout={auth.logout} />
          </ProtectedRoute>
        }
      />

            <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <VirtualKeyboard />
    </>
  );
}
