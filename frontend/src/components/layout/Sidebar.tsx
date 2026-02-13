import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, isRoomManager } = useAuth();

  const menuItems = [
    { path: '/', label: 'แดชบอร์ด', icon: '📊' },
    { path: '/rooms', label: 'ห้องประชุม', icon: '🏢' },
    { path: '/bookings/new', label: 'จองห้องประชุม', icon: '📝' },
    { path: '/my-bookings', label: 'การจองของฉัน', icon: '📋' },
  ];

  // เมนูสำหรับ admin
const adminMenuItems = [
  { path: '/admin/bookings', label: 'จัดการการจอง', icon: '✅' },
  { path: '/admin/rooms', label: 'จัดการห้องประชุม', icon: '⚙️' },
  { path: '/admin/users', label: 'จัดการผู้ใช้', icon: '👤' },
  { path: '/admin/departments', label: 'จัดการแผนก', icon: '🏢' },
  { path: '/admin/reports', label: 'รายงานสรุป', icon: '📊' },
];

  // เมนูสำหรับ room_manager approver
  const managerMenuItems = [
     { path: '/admin/bookings', label: 'จัดการการจอง', icon: '✅' },
];

  // เลือกเมนูพิเศษตาม role
  const extraMenuItems = isAdmin ? adminMenuItems : isRoomManager ? managerMenuItems : [];
  const extraMenuLabel = isAdmin ? 'ผู้ดูแลระบบ' : isRoomManager ? 'ผู้จัดการห้อง' : '';

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🏥</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">MeetingRoom</h1>
            <p className="text-xs text-gray-500">Booking System</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-3">เมนูหลัก</p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Extra Menu (Admin / Room Manager) */}
        {extraMenuItems.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase mt-6 mb-3 px-3">
              {extraMenuLabel}
            </p>
            <ul className="space-y-1">
              {extraMenuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">
              {user?.firstName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {user?.type === 'admin' ? 'ผู้ดูแลระบบ' : user?.type === 'room_manager' ? 'ผู้จัดการห้อง' : 'พนักงาน'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;