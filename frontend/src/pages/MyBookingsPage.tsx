import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../types/booking';
import * as bookingService from '../services/bookingService';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/animations';


const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartHour, setEditStartHour] = useState('09');
  const [editEndHour, setEditEndHour] = useState('10');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [historyBooking, setHistoryBooking] = useState<Booking | null>(null);

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

  const openEditModal = (booking: Booking) => {
    const start = new Date(booking.startDatetime);
    const end = new Date(booking.endDatetime);
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const dateStr = start.toLocaleDateString('sv-SE');
    const now = new Date();
    const isToday = dateStr === todayStr;
    let startHour = start.getHours();
    let endHour = end.getHours();
    if (isToday && startHour <= now.getHours()) {
      startHour = now.getHours() + 1;
      if (endHour <= startHour) endHour = startHour + 1;
      if (startHour > 18) startHour = 18;
      if (endHour > 18) endHour = 18;
    }
    setEditingBooking(booking);
    setEditTitle(booking.title);
    setEditDescription(booking.description || '');
    setEditDate(dateStr);
    setEditStartHour(String(startHour).padStart(2, '0'));
    setEditEndHour(String(endHour).padStart(2, '0'));
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingBooking) return;
    if (!editTitle.trim()) { setEditError('กรุณากรอกชื่อการจอง'); return; }
    if (editStartHour >= editEndHour) { setEditError('เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น'); return; }
    setIsSaving(true);
    setEditError('');
    try {
      const startDatetime = `${editDate}T${editStartHour}:00:00`;
      const endDatetime = `${editDate}T${editEndHour}:00:00`;
      const res = await bookingService.updateBooking(editingBooking.id, {
        title: editTitle,
        description: editDescription || undefined,
        startDatetime,
        endDatetime,
      });
      if (res.success) {
        setShowEditModal(false);
        setEditingBooking(null);
        loadBookings();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
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

  const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string; cardBg: string; cardBorder: string }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', label: 'รออนุมัติ', cardBg: 'bg-amber-50/50', cardBorder: 'border-l-amber-400' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'อนุมัติแล้ว', cardBg: 'bg-emerald-50/30', cardBorder: 'border-l-emerald-400' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', label: 'ปฏิเสธ', cardBg: 'bg-red-50/30', cardBorder: 'border-l-red-400' },
    cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'ยกเลิกแล้ว', cardBg: 'bg-slate-50/50', cardBorder: 'border-l-slate-300' },
  };

  const getStatusBadge = (status: string) => {
    const c = statusConfig[status] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: status, cardBg: '', cardBorder: '' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const getHistoryEvents = (b: Booking) => {
    const events: { label: string; by: string; time: string; color: string; icon: string }[] = [];
    events.push({
      label: 'สร้างการจอง',
      by: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'ผู้จอง',
      time: b.createdAt,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      icon: '📋',
    });
    const createdMs = new Date(b.createdAt).getTime();
    const updatedMs = new Date(b.updatedAt).getTime();
    const approvedMs = b.approvedAt ? new Date(b.approvedAt).getTime() : null;
    const wasEdited = updatedMs - createdMs > 60000 && (!approvedMs || updatedMs < approvedMs - 5000);
    if (wasEdited) {
      events.push({
        label: 'แก้ไขการจอง',
        by: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'ผู้จอง',
        time: b.updatedAt,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: '✏️',
      });
    }
    if (b.status === 'approved' && b.approvedAt) {
      events.push({
        label: 'อนุมัติการจอง',
        by: b.approver ? `${b.approver.firstName} ${b.approver.lastName}` : 'ผู้ดูแล',
        time: b.approvedAt,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        icon: '✅',
      });
    }
    if (b.status === 'rejected' && b.approvedAt) {
      events.push({
        label: 'ปฏิเสธการจอง',
        by: b.approver ? `${b.approver.firstName} ${b.approver.lastName}` : 'ผู้ดูแล',
        time: b.approvedAt,
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: '❌',
      });
    }
    if (b.status === 'cancelled') {
      events.push({
        label: 'ยกเลิกการจอง',
        by: b.user ? `${b.user.firstName} ${b.user.lastName}` : 'ผู้จอง',
        time: b.updatedAt,
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        icon: '🚫',
      });
    }
    return events;
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('th-TH', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('th-TH', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filterTabs = [
    { value: 'all', label: 'ทั้งหมด', count: counts.all, color: 'teal' },
    { value: 'pending', label: 'รออนุมัติ', count: counts.pending, color: 'amber' },
    { value: 'approved', label: 'อนุมัติแล้ว', count: counts.approved, color: 'emerald' },
    { value: 'rejected', label: 'ปฏิเสธ', count: counts.rejected, color: 'red' },
    { value: 'cancelled', label: 'ยกเลิก', count: counts.cancelled, color: 'slate' },
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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
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
        <button
          onClick={() => navigate('/bookings/new')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          จองเพิ่ม
        </button>
      </div>

      {/* Stats Summary Bar */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'รออนุมัติ', count: counts.pending, gradient: 'from-amber-400 to-amber-500', shadow: 'shadow-amber-400/30', onClick: () => setFilter('pending') },
            { label: 'อนุมัติแล้ว', count: counts.approved, gradient: 'from-emerald-400 to-emerald-500', shadow: 'shadow-emerald-400/30', onClick: () => setFilter('approved') },
            { label: 'ปฏิเสธ', count: counts.rejected, gradient: 'from-red-400 to-red-500', shadow: 'shadow-red-400/30', onClick: () => setFilter('rejected') },
            { label: 'ยกเลิก', count: counts.cancelled, gradient: 'from-slate-400 to-slate-500', shadow: 'shadow-slate-400/20', onClick: () => setFilter('cancelled') },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-3 text-white text-left shadow-md ${stat.shadow} hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-white/80 mt-0.5">{stat.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl font-medium transition-all ${
              filter === tab.value
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                filter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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
          <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <p className="text-slate-600 text-sm font-medium">
            {filter === 'all' ? 'ยังไม่มีการจอง' : 'ไม่มีรายการที่ตรงกับตัวกรอง'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/bookings/new')}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-teal-600 font-semibold bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              จองห้องประชุม
            </button>
          )}
        </div>
      ) : (
        <StaggerContainer key={filter} className="space-y-3">
          {filteredBookings.map((booking) => {
            const sc = statusConfig[booking.status] || statusConfig['cancelled'];
            return (
              <StaggerItem key={booking.id}>
                <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${sc.cardBorder} overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-teal-100">
                        <span className="text-[10px] text-teal-500 font-semibold leading-none uppercase">
                          {new Date(booking.startDatetime).toLocaleDateString('th-TH', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold text-teal-700 leading-none mt-0.5">
                          {new Date(booking.startDatetime).getDate()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h3 className="font-semibold text-slate-800 text-sm truncate">{booking.title}</h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setHistoryBooking(booking)}
                              className="px-3 py-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200 transition font-medium"
                            >
                              ประวัติ
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => openEditModal(booking)}
                                  className="px-3 py-1.5 text-xs text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 border border-teal-100 transition font-medium"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  onClick={() => openCancelModal(booking.id)}
                                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition font-medium"
                                >
                                  ยกเลิก
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium text-slate-600">{booking.room?.name}</span>
                            <span className="text-slate-300">·</span>
                            <span>{booking.room?.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span>{formatDate(booking.startDatetime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{formatTime(booking.startDatetime)} – {formatTime(booking.endDatetime)} น.</span>
                          </div>
                          {booking.description && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                              </svg>
                              <span className="truncate text-slate-400 italic">{booking.description}</span>
                            </div>
                          )}
                          {booking.approver && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>ผู้ดำเนินการ: <span className="font-medium text-slate-600">{booking.approver.firstName} {booking.approver.lastName}</span></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* History Modal */}
      {historyBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">ประวัติการจอง</h2>
                <p className="text-xs text-slate-400 mt-0.5">{historyBooking.title}</p>
              </div>
              <button onClick={() => setHistoryBooking(null)} className="text-slate-400 hover:text-slate-600 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-5">
                {getHistoryEvents(historyBooking).map((event, i) => (
                  <div key={i} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm shrink-0 ${event.color}`}>
                      {event.icon}
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="text-sm font-semibold text-slate-700">{event.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">โดย {event.by}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(event.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setHistoryBooking(null)}
              className="w-full mt-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">แก้ไขการจอง</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ชื่อการจอง *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">รายละเอียด</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">วันที่</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">เวลาเริ่มต้น</label>
                  <select
                    value={editStartHour}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setEditStartHour(newStart);
                      if (editEndHour <= newStart) {
                        setEditEndHour(String(parseInt(newStart) + 1).padStart(2, '0'));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => String(i + 9).padStart(2, '0')).map((h) => {
                      const isToday = editDate === new Date().toLocaleDateString('sv-SE');
                      const nowHour = new Date().getHours();
                      const disabled = isToday && parseInt(h) <= nowHour;
                      return <option key={h} value={h} disabled={disabled}>{h}:00</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">เวลาสิ้นสุด</label>
                  <select
                    value={editEndHour}
                    onChange={(e) => setEditEndHour(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => String(i + 9).padStart(2, '0')).map((h) => (
                      <option key={h} value={h} disabled={h <= editStartHour}>{h}:00</option>
                    ))}
                  </select>
                </div>
              </div>
              {editError && <p className="text-red-500 text-xs">{editError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditSubmit}
                disabled={isSaving}
                className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition text-sm disabled:opacity-50"
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                onClick={() => { setShowEditModal(false); setEditingBooking(null); }}
                className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">ยกเลิกการจอง</h2>
            <p className="text-slate-400 text-sm mb-6">ต้องการยกเลิกการจองนี้หรือไม่?<br />การกระทำนี้ไม่สามารถย้อนกลับได้</p>
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
