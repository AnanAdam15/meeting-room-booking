import { useState, useEffect } from 'react';
import type { Booking } from '../../types/booking';
import * as bookingService from '../../services/bookingService';
import api from '../../services/api';
import { PageTransition, StaggerContainer, StaggerItem } from '../../components/animations';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingBookingId, setApprovingBookingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  const openApproveModal = (id: string) => {
    setApprovingBookingId(id);
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!approvingBookingId) return;
    try {
      await bookingService.approveBooking(approvingBookingId, { status: 'approved' });
      setShowApproveModal(false);
      setApprovingBookingId(null);
      setNotification({ type: 'success', message: 'อนุมัติการจองสำเร็จ' });
      loadBookings();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
    }
  };

  const openRejectModal = (bookingId: string) => {
    setRejectingBookingId(bookingId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectingBookingId) return;
    if (!rejectReason.trim()) {
      setNotification({ type: 'error', message: 'กรุณากรอกเหตุผลในการปฏิเสธ' });
      return;
    }
    try {
      await bookingService.approveBooking(rejectingBookingId, {
        status: 'rejected',
        reason: rejectReason.trim(),
      });
      setShowRejectModal(false);
      setRejectingBookingId(null);
      setNotification({ type: 'success', message: 'ปฏิเสธการจองสำเร็จ' });
      loadBookings();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
    }
  };

  const handleTestReminder = async (bookingId: string) => {
    try {
      const response = await api.post('/bookings/test-reminder', { bookingId });
      if (response.data.success) {
        setNotification({ type: 'success', message: response.data.message });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'ส่งอีเมลเตือนไม่สำเร็จ' });
    }
  };

  const openDeleteModal = (id: string) => {
    setDeletingBookingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingBookingId) return;
    try {
      await bookingService.deleteBooking(deletingBookingId);
      setShowDeleteModal(false);
      setDeletingBookingId(null);
      setNotification({ type: 'success', message: 'ลบการจองสำเร็จ' });
      loadBookings();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'รออนุมัติ' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'อนุมัติแล้ว' },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'ปฏิเสธ' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'ยกเลิกแล้ว' },
    };
    return config[status] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: status };
  };

  const getStatusBadge = (status: string) => {
    const c = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
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

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const summaryCards = [
    { label: 'ทั้งหมด', value: counts.all, color: 'bg-teal-50 text-teal-600 border-teal-100', iconBg: 'bg-teal-100',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
    { label: 'รออนุมัติ', value: counts.pending, color: 'bg-amber-50 text-amber-600 border-amber-100', iconBg: 'bg-amber-100',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'อนุมัติแล้ว', value: counts.approved, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', iconBg: 'bg-emerald-100',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'ปฏิเสธ', value: counts.rejected, color: 'bg-red-50 text-red-600 border-red-100', iconBg: 'bg-red-100',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'ยกเลิก', value: counts.cancelled, color: 'bg-slate-50 text-slate-500 border-slate-200', iconBg: 'bg-slate-100',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> },
  ];

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
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          จัดการการจอง
        </div>
        <h1 className="text-2xl font-bold text-slate-800">อนุมัติ / ปฏิเสธคำขอจอง</h1>
        <p className="text-slate-400 text-sm mt-1">จัดการคำขอจองห้องประชุมทั้งหมด</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`px-4 py-3 rounded-xl mb-4 text-sm flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            )}
            {notification.message}
          </div>
          <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {summaryCards.map((card) => (
          <StaggerItem key={card.label}>
          <div className={`rounded-xl border p-3.5 ${card.color}`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs opacity-70">{card.label}</p>
        </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              filter === tab.value
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">ไม่มีรายการ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">หัวข้อ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ผู้จอง</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">ห้อง</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">วันที่ / เวลา</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-700">{booking.title}</p>
                      {booking.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{booking.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-teal-600">
                            {booking.user?.firstName?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-slate-600">{booking.user?.firstName} {booking.user?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{booking.room?.name}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-600">{formatDate(booking.startDatetime)}</p>
                      <p className="text-xs text-slate-400">{formatTime(booking.startDatetime)} - {formatTime(booking.endDatetime)}</p>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(booking.status)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openApproveModal(booking.id)}
                              className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition font-medium"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => openRejectModal(booking.id)}
                              className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition font-medium"
                            >
                              ปฏิเสธ
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => handleTestReminder(booking.id)}
                            className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-100 transition font-medium flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            ทดสอบเตือน
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(booking.id)}
                          className="px-3 py-1.5 text-xs bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 border border-slate-200 transition font-medium"
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">ปฏิเสธการจอง</h2>
                <p className="text-xs text-slate-400">กรุณาระบุเหตุผลในการปฏิเสธ</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="เช่น ห้องถูกใช้งานเพื่อกิจกรรมอื่น, เวลาไม่เหมาะสม"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none text-sm text-slate-700 placeholder:text-slate-300"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm">
                ยืนยันปฏิเสธ
              </button>
              <button onClick={() => { setShowRejectModal(false); setRejectingBookingId(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">อนุมัติการจอง</h2>
            <p className="text-slate-400 text-sm mb-6">ต้องการอนุมัติการจองนี้หรือไม่?</p>
            <div className="flex gap-3">
              <button onClick={handleApprove} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition text-sm">
                ยืนยันอนุมัติ
              </button>
              <button onClick={() => { setShowApproveModal(false); setApprovingBookingId(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">ลบการจอง</h2>
            <p className="text-slate-400 text-sm mb-6">ต้องการลบการจองนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm">
                ยืนยันลบ
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeletingBookingId(null); }} className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
    </PageTransition>
  );
};

export default AdminBookingsPage;