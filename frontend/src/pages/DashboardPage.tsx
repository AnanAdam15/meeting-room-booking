import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Booking } from '../types/booking';
import type { Room } from '../types/room';
import * as bookingService from '../services/bookingService';
import * as roomService from '../services/roomService';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/animations';


const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
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

      if (isAdmin) {
        const allRes = await bookingService.getAllBookings();
        if (allRes.success && allRes.data) setAllBookings(allRes.data);
      }
    } catch (error) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingBookings = isAdmin
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
    <div>
      {/* Header */}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          แดชบอร์ด
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {getGreeting()}, {user?.firstName} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          สรุปข้อมูลการจองห้องประชุมของคุณ
        </p>
      </div>

      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'ห้องประชุม',
            value: rooms.length,
            sub: `ว่าง ${rooms.filter(r => r.status === 'available').length} ห้อง`,
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ),
            color: 'bg-teal-50 text-teal-600 border-teal-100',
            iconBg: 'bg-teal-100',
            onClick: () => navigate('/rooms'),
          },
          {
            label: 'การจองวันนี้',
            value: todayBookings.length,
            sub: 'รายการ',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            ),
            color: 'bg-sky-50 text-sky-600 border-sky-100',
            iconBg: 'bg-sky-100',
            onClick: () => navigate('/my-bookings'),
          },
          {
            label: isAdmin ? 'รออนุมัติ (ทั้งหมด)' : 'รออนุมัติ',
            value: pendingBookings.length,
            sub: 'รายการ',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: 'bg-amber-50 text-amber-600 border-amber-100',
            iconBg: 'bg-amber-100',
            onClick: () => isAdmin ? navigate('/admin/bookings') : navigate('/my-bookings'),
          },
          {
            label: 'อนุมัติแล้ว',
            value: approvedBookings.length,
            sub: 'รายการ',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            iconBg: 'bg-emerald-100',
            onClick: () => navigate('/my-bookings'),
          },
        ].map((card) => (
          <StaggerItem key={card.label}>
          <div
            onClick={card.onClick}
            className={`rounded-xl border p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${card.color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                {card.icon}
              </div>
              <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{card.label}</p>
       </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <h2 className="font-semibold text-slate-800 text-sm">การจองที่กำลังจะมาถึง</h2>
            </div>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
            >
              ดูทั้งหมด →
            </button>
          </div>
          <div className="p-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">ไม่มีการจองที่กำลังจะมาถึง</p>
                <button
                  onClick={() => navigate('/bookings/new')}
                  className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  + จองห้องประชุม
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group cursor-pointer"
                    onClick={() => navigate('/my-bookings')}
                  >
                    {/* Date badge */}
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex flex-col items-center justify-center shrink-0 border border-teal-100">
                      <span className="text-[10px] text-teal-500 font-medium leading-none">
                        {new Date(booking.startDatetime).toLocaleDateString('th-TH', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-teal-700 leading-none mt-0.5">
                        {new Date(booking.startDatetime).getDate()}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 text-sm truncate group-hover:text-teal-700 transition">
                        {booking.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {booking.room?.name}
                      </p>
                    </div>
                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-600">
                        {formatTime(booking.startDatetime)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ถึง {formatTime(booking.endDatetime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: 'text-teal-600 bg-teal-50 hover:bg-teal-100 border-teal-100',
                iconBg: 'bg-teal-100',
                onClick: () => navigate('/bookings/new'),
              },
              {
                label: 'ดูห้องประชุม',
                desc: 'ดูรายละเอียดและสถานะห้อง',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                color: 'text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-100',
                iconBg: 'bg-sky-100',
                onClick: () => navigate('/rooms'),
              },
              {
                label: 'การจองของฉัน',
                desc: 'ตรวจสอบสถานะการจอง',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                ),
                color: 'text-violet-600 bg-violet-50 hover:bg-violet-100 border-violet-100',
                iconBg: 'bg-violet-100',
                onClick: () => navigate('/my-bookings'),
              },
              ...(isAdmin ? [{
                label: 'อนุมัติการจอง',
                desc: `มี ${pendingBookings.length} รายการรออนุมัติ`,
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100',
                iconBg: 'bg-amber-100',
                onClick: () => navigate('/admin/bookings'),
              }] : []),
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left hover:-translate-y-0.5 hover:shadow-sm ${action.color}`}
              >
                <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs opacity-60 mt-0.5">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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