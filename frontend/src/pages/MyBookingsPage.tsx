import { useState, useEffect } from 'react';
import type { Booking } from '../types/booking';
import * as bookingService from '../services/bookingService';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/animations';


const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const openCancelModal = (id: string) => {
    setCancellingId(id);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancellingId) return;
    try {
      const response = await bookingService.cancelBooking(cancellingId);
      if (response.success) {
        setShowCancelModal(false);
        setCancellingId(null);
        loadBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
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

  const getCardBorder = (status: string) => {
    const borders: Record<string, string> = {
      pending: 'border-l-amber-400',
      approved: 'border-l-emerald-400',
      rejected: 'border-l-red-400',
      cancelled: 'border-l-slate-300',
    };
    return borders[status] || 'border-l-slate-300';
  };


  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('th-TH', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filterTabs = [
    { value: 'all', label: 'ทั้งหมด', count: counts.all },
    { value: 'pending', label: 'รออนุมัติ', count: counts.pending },
    { value: 'approved', label: 'อนุมัติแล้ว', count: counts.approved },
    { value: 'rejected', label: 'ปฏิเสธ', count: counts.rejected },
    { value: 'cancelled', label: 'ยกเลิกแล้ว', count: counts.cancelled },
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-teal-600 font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            การจองของฉัน
          </div>
          <h1 className="text-2xl font-bold text-slate-800">รายการจองทั้งหมด</h1>
          <p className="text-slate-400 text-sm mt-1">{bookings.length} รายการ</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              filter === tab.value
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.value ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">
            {filter === 'all' ? 'ยังไม่มีการจอง' : 'ไม่มีรายการที่ตรงกับตัวกรอง'}
          </p>
        </div>
      ) : (
        <StaggerContainer className="space-y-3">
          {filteredBookings.map((booking) => (
            <StaggerItem key={booking.id}>
            <div
              className={`bg-white rounded-xl border border-slate-200 border-l-4 ${getCardBorder(booking.status)} p-5 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Date badge + Info */}
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Date badge */}
                  <div className="w-14 h-14 bg-teal-50 rounded-xl flex flex-col items-center justify-center shrink-0 border border-teal-100">
                    <span className="text-[10px] text-teal-500 font-medium leading-none">
                      {new Date(booking.startDatetime).toLocaleDateString('th-TH', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold text-teal-700 leading-none mt-0.5">
                      {new Date(booking.startDatetime).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{booking.title}</h3>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="space-y-1 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{booking.room?.name} · {booking.room?.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(booking.startDatetime)} - {formatTime(booking.endDatetime)}</span>
                      </div>
                      {booking.description && (
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          <span className="truncate">{booking.description}</span>
                        </div>
                      )}
                      {booking.approver && (
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>ผู้อนุมัติ: {booking.approver.firstName} {booking.approver.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cancel button */}
                {booking.status === 'pending' && (
                  <button
                    onClick={() => openCancelModal(booking.id)}
                    className="px-3.5 py-2 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition font-medium shrink-0"
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
          </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">ยกเลิกการจอง</h2>
            <p className="text-slate-400 text-sm mb-6">ต้องการยกเลิกการจองนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm"
              >
                ยืนยันยกเลิก
              </button>
              <button
                onClick={() => { setShowCancelModal(false); setCancellingId(null); }}
                className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
              >
                ไม่ใช่
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
    </PageTransition>
  );
};

export default MyBookingsPage;