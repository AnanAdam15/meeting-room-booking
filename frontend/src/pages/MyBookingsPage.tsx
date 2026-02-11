import { useState, useEffect } from 'react';
import type { Booking } from '../types/booking';
import * as bookingService from '../services/bookingService';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getMyBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('โหลดข้อมูลการจองไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ยกเลิกการจอง
  const handleCancel = async (id: string) => {
    if (!window.confirm('ต้องการยกเลิกการจองนี้หรือไม่?')) return;

    try {
      const response = await bookingService.cancelBooking(id);
      if (response.success) {
        loadBookings(); // โหลดใหม่
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  // กรอง
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  // แสดงสถานะเป็นภาษาไทย
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    const labels: Record<string, string> = {
      pending: 'รออนุมัติ',
      approved: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ',
      cancelled: 'ยกเลิกแล้ว',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // แปลงวันที่
  const formatDate = (datetime: string) => {
    const d = new Date(datetime);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (datetime: string) => {
    const d = new Date(datetime);
    return d.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">การจองของฉัน</h1>
          <p className="text-gray-500 mt-1">ทั้งหมด {bookings.length} รายการ</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'ทั้งหมด' },
          { value: 'pending', label: 'รออนุมัติ' },
          { value: 'approved', label: 'อนุมัติแล้ว' },
          { value: 'rejected', label: 'ปฏิเสธ' },
          { value: 'cancelled', label: 'ยกเลิกแล้ว' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 text-sm rounded-lg transition ${
              filter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {filter === 'all' ? 'ยังไม่มีการจอง' : 'ไม่มีรายการที่ตรงกับตัวกรอง'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                {/* ข้อมูลการจอง */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{booking.title}</h3>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="space-y-1 text-sm text-gray-500">
                    <p>🏢 ห้อง: {booking.room?.name} - {booking.room?.location}</p>
                    <p>📅 วันที่: {formatDate(booking.startDatetime)}</p>
                    <p>⏰ เวลา: {formatTime(booking.startDatetime)} - {formatTime(booking.endDatetime)}</p>
                    {booking.description && <p>📝 {booking.description}</p>}
                    {booking.approver && (
                      <p>👤 ผู้อนุมัติ: {booking.approver.firstName} {booking.approver.lastName}</p>
                    )}
                  </div>
                </div>

                {/* ปุ่มยกเลิก (เฉพาะ pending) */}
                <div className="flex gap-2 ml-4">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;