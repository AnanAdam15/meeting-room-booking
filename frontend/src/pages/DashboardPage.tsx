import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Booking } from '../types/booking';
import type { Room } from '../types/room';
import * as bookingService from '../services/bookingService';
import * as roomService from '../services/roomService';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/animations';


const DashboardPage = () => {
  const { user, isAdmin, isRoomManager } = useAuth();
  const navigate = useNavigate();

  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [myRes, roomRes] = await Promise.all([
        bookingService.getMyBookings(),
        roomService.getAllRooms(),
      ]);

      if (myRes.success && myRes.data) setMyBookings(myRes.data);
      if (roomRes.success && roomRes.data) setRooms(roomRes.data);

      if (isAdmin || isRoomManager) {
        const allRes = await bookingService.getAllBookings();
        if (allRes.success && allRes.data) setAllBookings(allRes.data);
      }
    } catch (error) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingBookings = (isAdmin || isRoomManager)
    ? allBookings.filter((b) => b.status === 'pending')
    : myBookings.filter((b) => b.status === 'pending');

  const approvedBookings = myBookings.filter((b) => b.status === 'approved');

  const todayBookings = myBookings.filter((b) => {
    const today = new Date().toDateString();
    return new Date(b.startDatetime).toDateString() === today && b.status !== 'cancelled';
  });

  const upcomingBookings = myBookings
    .filter((b) => b.status === 'approved' && new Date(b.startDatetime) > new Date())
    .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
    .slice(0, 5);

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('th-TH', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="space-y-6">

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 bg-teal-400/10 rounded-full" />
        <div className="absolute top-6 right-12 w-2.5 h-2.5 bg-teal-300/40 rounded-full" />
        <div className="absolute top-14 right-24 w-1.5 h-1.5 bg-white/20 rounded-full" />
        <div className="absolute bottom-8 right-8 w-2 h-2 bg-cyan-300/30 rounded-full" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-teal-200/80 text-sm font-medium mb-1.5">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {getGreeting()}  {user?.firstName}
            </h1>
            <p className="text-teal-200/60 text-sm">
              {(isAdmin || isRoomManager)
                ? `มีคำขอจองรออนุมัติ ${pendingBookings.length} รายการ`
                : 'ยินดีต้อนรับสู่ระบบจองห้องประชุม'}
            </p>
          </div>
          <button
            onClick={() => navigate('/bookings/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 text-sm font-semibold rounded-xl hover:bg-teal-50 active:scale-95 transition-all shadow-lg shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            จองห้องประชุม
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'ห้องประชุม',
            value: rooms.length,
            sub: `ว่าง ${rooms.filter(r => r.status === 'available').length} ห้อง`,
            gradient: 'from-teal-500 to-teal-600',
            shadow: 'shadow-teal-500/30',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ),
            onClick: () => navigate('/rooms'),
          },
          {
            label: 'การจองวันนี้',
            value: todayBookings.length,
            sub: 'รายการวันนี้',
            gradient: 'from-sky-500 to-sky-600',
            shadow: 'shadow-sky-500/30',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            ),
            onClick: () => navigate('/my-bookings'),
          },
          {
            label: isAdmin || isRoomManager ? 'รออนุมัติ (ทั้งหมด)' : 'รออนุมัติ',
            value: pendingBookings.length,
            sub: 'รายการ',
            gradient: 'from-amber-500 to-orange-500',
            shadow: 'shadow-amber-500/30',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            onClick: () => (isAdmin || isRoomManager) ? navigate('/admin/bookings?status=pending') : navigate('/my-bookings'),
          },
          {
            label: 'อนุมัติแล้ว',
            value: approvedBookings.length,
            sub: 'รายการ',
            gradient: 'from-emerald-500 to-emerald-600',
            shadow: 'shadow-emerald-500/30',
            icon: (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            onClick: () => navigate('/my-bookings'),
          },
        ].map((card) => (
          <StaggerItem key={card.label}>
            <div
              onClick={card.onClick}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all text-white shadow-lg ${card.shadow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {card.icon}
                </div>
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
              <p className="text-3xl font-bold tracking-tight">{card.value}</p>
              <p className="text-sm font-medium text-white/90 mt-0.5">{card.label}</p>
              <p className="text-xs text-white/60 mt-0.5">{card.sub}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <h2 className="font-semibold text-slate-800 text-sm">การจองที่กำลังจะมาถึง</h2>
            </div>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium transition"
            >
              ดูทั้งหมด →
            </button>
          </div>
          <div className="p-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="text-slate-600 text-sm font-medium">ไม่มีการจองที่กำลังจะมาถึง</p>
                <p className="text-slate-400 text-xs mt-1">เริ่มจองห้องประชุมได้เลย</p>
                <button
                  onClick={() => navigate('/bookings/new')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-teal-600 font-semibold bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  จองห้องประชุม
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group cursor-pointer"
                    onClick={() => navigate('/my-bookings')}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-teal-100">
                      <span className="text-[10px] text-teal-500 font-medium leading-none">
                        {new Date(booking.startDatetime).toLocaleDateString('th-TH', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-teal-700 leading-none mt-0.5">
                        {new Date(booking.startDatetime).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 text-sm truncate group-hover:text-teal-700 transition">
                        {booking.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.room?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-600">{formatTime(booking.startDatetime)}</p>
                      <p className="text-[10px] text-slate-400">ถึง {formatTime(booking.endDatetime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              เมนูลัด
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              {
                label: 'จองห้องประชุม',
                desc: 'เลือกห้องและเวลาที่ต้องการ',
                gradient: 'from-teal-500 to-teal-600',
                shadow: 'shadow-teal-500/20',
                onClick: () => navigate('/bookings/new'),
              },
              {
                label: 'ดูห้องประชุม',
                desc: 'ดูรายละเอียดและสถานะห้อง',
                gradient: 'from-sky-500 to-sky-600',
                shadow: 'shadow-sky-500/20',
                onClick: () => navigate('/rooms'),
              },
              {
                label: 'การจองของฉัน',
                desc: 'ตรวจสอบสถานะการจอง',
                gradient: 'from-violet-500 to-violet-600',
                shadow: 'shadow-violet-500/20',
                onClick: () => navigate('/my-bookings'),
              },
              ...((isAdmin || isRoomManager) ? [{
                label: 'อนุมัติการจอง',
                desc: `มี ${pendingBookings.length} รายการรออนุมัติ`,
                gradient: 'from-amber-500 to-orange-500',
                shadow: 'shadow-amber-500/20',
                onClick: () => navigate('/admin/bookings?status=pending'),
              }] : []),
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all text-left bg-white group"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shrink-0 shadow-md ${action.shadow}`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm group-hover:text-slate-900 transition">{action.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default DashboardPage;
