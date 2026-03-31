import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-teal-600">
              {user?.firstName?.charAt(0)}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700">
               {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            ออกจากระบบ
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;