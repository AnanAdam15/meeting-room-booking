import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            สวัสดี, {user?.firstName} 👋
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;