import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Booking } from '../types/booking';
import type { Room } from '../types/room';
import * as bookingService from '../services/bookingService';
import * as roomService from '../services/roomService';

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

      // ถ้าเป็น admin ให้โหลดการจองทั้งหมดด้วย
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

  // นับข้อมูลต่างๆ
  const pendingBookings = isAdmin
    ? allBookings.filter((b) => b.status === 'pending')
    : myBookings.filter((b) => b.status === 'pending');

  const approvedBookings = myBookings.filter((b) => b.status === 'approved');

  const todayBookings = myBookings.filter((b) => {
    const today = new Date().toDateString();
    return new Date(b.startDatetime).toDateString() === today && b.status !== 'cancelled';
  });

  // การจองที่กำลังจะมาถึง (approved, ยังไม่ผ่าน)
  const upcomingBookings = myBookings
    .filter((b) => b.status === 'approved' && new Date(b.startDatetime) > new Date())
    .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
    .slice(0, 5);

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('th-TH', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
        <p className="text-gray-500 mt-1">
          ยินดีต้อนรับ, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* สรุปข้อมูล */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => navigate('/rooms')}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{rooms.length}</p>
              <p className="text-sm text-gray-500">ห้องประชุม</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/my-bookings')}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{todayBookings.length}</p>
              <p className="text-sm text-gray-500">การจองวันนี้</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => isAdmin ? navigate('/admin/bookings') : navigate('/my-bookings')}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingBookings.length}</p>
              <p className="text-sm text-gray-500">
                {isAdmin ? 'รออนุมัติ (ทั้งหมด)' : 'รออนุมัติ'}
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/my-bookings')}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{approvedBookings.length}</p>
              <p className="text-sm text-gray-500">อนุมัติแล้ว</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* การจองที่กำลังจะมาถึง */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">📋 การจองที่กำลังจะมาถึง</h2>
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">ไม่มีการจองที่กำลังจะมาถึง</p>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-sm">🏢</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{booking.title}</p>
                    <p className="text-xs text-gray-500">
                      {booking.room?.name} • {formatDate(booking.startDatetime)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-blue-600">
                      {formatTime(booking.startDatetime)}
                    </p>
                    <p className="text-xs text-gray-400">
                      - {formatTime(booking.endDatetime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ห้องประชุมยอดนิยม / Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">⚡ เมนูลัด</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/bookings/new')}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left"
            >
              <span className="text-xl">📝</span>
              <div>
                <p className="font-medium text-blue-800 text-sm">จองห้องประชุม</p>
                <p className="text-xs text-blue-500">เลือกห้องและเวลาที่ต้องการ</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/rooms')}
              className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
            >
              <span className="text-xl">🏢</span>
              <div>
                <p className="font-medium text-green-800 text-sm">ดูห้องประชุม</p>
                <p className="text-xs text-green-500">ดูรายละเอียดและสถานะห้อง</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left"
            >
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-purple-800 text-sm">การจองของฉัน</p>
                <p className="text-xs text-purple-500">ตรวจสอบสถานะการจอง</p>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate('/admin/bookings')}
                className="w-full flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left"
              >
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-medium text-yellow-800 text-sm">อนุมัติการจอง</p>
                  <p className="text-xs text-yellow-500">
                    มี {pendingBookings.length} รายการรออนุมัติ
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;