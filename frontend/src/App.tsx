import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import CreateBookingPage from './pages/CreateBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import ReportPage from './pages/admin/ReportPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// ป้องกันหน้า Admin (เฉพาะ admin เท่านั้น)
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

// ป้องกันหน้าจัดการห้อง (admin หรือ room_manager)
const RoomManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isRoomManager } = useAuth();
  if (!isAdmin && !isRoomManager) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/bookings/new" element={<CreateBookingPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />

        {/* Admin only */}
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><ReportPage /></AdminRoute>} />

        {/* Admin + Room Manager */}
        <Route path="/admin/rooms" element={<RoomManagerRoute><AdminRoomsPage /></RoomManagerRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;