import { useState, useEffect } from 'react';
import type { Booking } from '../../types/booking';
import * as bookingService from '../../services/bookingService';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getAllBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // อนุมัติ
  const handleApprove = async (id: string) => {
    if (!window.confirm('ต้องการอนุมัติการจองนี้หรือไม่?')) return;
    try {
      await bookingService.approveBooking(id, { status: 'approved' });
      loadBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  // ปฏิเสธ
  const handleReject = async (id: string) => {
    if (!window.confirm('ต้องการปฏิเสธการจองนี้หรือไม่?')) return;
    try {
      await bookingService.approveBooking(id, { status: 'rejected' });
      loadBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  // ลบ
  const handleDelete = async (id: string) => {
    if (!window.confirm('ต้องการลบการจองนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      await bookingService.deleteBooking(id);
      loadBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

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
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

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

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  // นับจำนวนแต่ละสถานะ
  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
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
        <h1 className="text-2xl font-bold text-gray-800">จัดการการจอง</h1>
        <p className="text-gray-500 mt-1">อนุมัติ/ปฏิเสธคำขอจองห้องประชุม</p>
      </div>

      {/* สรุปจำนวน */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'ทั้งหมด', value: counts.all, color: 'bg-blue-50 text-blue-700' },
          { label: 'รออนุมัติ', value: counts.pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'อนุมัติแล้ว', value: counts.approved, color: 'bg-green-50 text-green-700' },
          { label: 'ปฏิเสธ', value: counts.rejected, color: 'bg-red-50 text-red-700' },
          { label: 'ยกเลิก', value: counts.cancelled, color: 'bg-gray-50 text-gray-500' },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg p-3 text-center ${item.color}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
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

      {/* Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">ไม่มีรายการ</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">หัวข้อ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ผู้จอง</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ห้อง</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่/เวลา</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{booking.title}</p>
                      {booking.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{booking.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {booking.user?.firstName} {booking.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {booking.room?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{formatDate(booking.startDatetime)}</p>
                      <p className="text-xs text-gray-400">
                        {formatTime(booking.startDatetime)} - {formatTime(booking.endDatetime)}
                      </p>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => handleReject(booking.id)}
                              className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="px-3 py-1.5 text-xs bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;