import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, isRoomManager } = useAuth();

  const menuItems = [
    {
      path: '/', label: 'แดชบอร์ด', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    },
    {
      path: '/rooms', label: 'ห้องประชุม', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    },
    {
      path: '/bookings/new', label: 'จองห้องประชุม', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      path: '/my-bookings', label: 'การจองของฉัน', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>,
    },
  ];

  const adminMenuItems = [
    {
      path: '/admin/bookings?status=pending', label: 'จัดการการจอง', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      path: '/admin/rooms', label: 'จัดการห้องประชุม', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      path: '/admin/users', label: 'จัดการผู้ใช้', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
      path: '/admin/departments', label: 'จัดการแผนก', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
    },
    {
      path: '/admin/reports', label: 'รายงานสรุป', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    },
  ];

  const managerMenuItems = [
    {
      path: '/admin/bookings?status=pending', label: 'จัดการการจอง', badge: 0,
      icon: <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  const extraMenuItems = isAdmin ? adminMenuItems : isRoomManager ? managerMenuItems : [];
  const extraMenuLabel = isAdmin ? 'ผู้ดูแลระบบ' : isRoomManager ? 'ผู้อนุมัติ' : '';

  const getRoleBadge = () => {
    if (user?.type === 'admin') return { label: 'Admin', color: 'bg-violet-400/20 text-violet-300' };
    if (user?.type === 'approver') return { label: 'Approver', color: 'bg-amber-400/20 text-amber-300' };
    return { label: 'Member', color: 'bg-slate-400/20 text-slate-300' };
  };

  const role = getRoleBadge();

  // Shared menu item renderer
  const MenuItem = ({ item, isEnd = false }: { item: typeof menuItems[0]; isEnd?: boolean }) => (
    <li>
      <NavLink
        to={item.path}
        end={isEnd}
        className={({ isActive }) =>
          `group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
            isActive
              ? 'bg-white/15 text-white font-medium shadow-sm shadow-black/10'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Active indicator bar ซ้าย */}
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-300 ${
                isActive
                  ? 'h-6 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                  : 'h-0 bg-transparent group-hover:h-3 group-hover:bg-white/30'
              }`}
            />
            <span className="ml-1">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {/* Notification badge */}
            {item.badge > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-rose-500/30 animate-pulse">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );

  return (
    <aside
      className="w-64 h-screen sticky top-0 flex flex-col relative overflow-hidden shrink-0"
      style={{
        background: 'linear-gradient(180deg, #0f4f4a 0%, #134e4a 30%, #1a3a4a 70%, #1e293b 100%)',
      }}
    >
      {/* Decorative blur circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -left-10 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">MeetingRoom</h1>
            <p className="text-[10px] text-teal-300/50">Booking System</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="relative z-10 flex-1 p-3 overflow-y-auto">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-2 px-3">เมนูหลัก</p>
        <ul className="space-y-0.5">
          {menuItems.map((item) => (
            <MenuItem key={item.path} item={item} isEnd={item.path === '/'} />
          ))}
        </ul>

        {/* Extra Menu */}
        {extraMenuItems.length > 0 && (
          <>
            <div className="my-4 px-3">
              <div className="border-t border-white/10" />
            </div>
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-2 px-3">
              {extraMenuLabel}
            </p>
            <ul className="space-y-0.5">
              {extraMenuItems.map((item) => (
                <MenuItem key={item.path} item={item} />
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="relative z-10 p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/20">
            <span className="text-sm font-semibold text-white">
              {user?.firstName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${role.color}`}>
              {role.label}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;