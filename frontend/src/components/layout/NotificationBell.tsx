import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import * as notificationService from '../../services/notificationService';
import type { Notification } from '../../services/notificationService';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // โหลดจำนวนที่ยังไม่อ่าน (poll ทุก 30 วินาที)
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // loadUnreadCount → notificationService.getUnreadCount() [services/notificationService.ts]
  //   → GET /api/notifications/unread-count [backend: notification.controller.ts]
  //     → prisma.notification.count({ where: { userId, isRead: false } })
  // ← setUnreadCount(n) → แสดง badge บน bell icon
  const loadUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) setUnreadCount(res.data.count);
    } catch (err) {
      console.error('โหลดจำนวนแจ้งเตือนไม่สำเร็จ:', err);
    }
  };

  // loadNotifications → notificationService.getMyNotifications()
  //   → GET /api/notifications [backend: notification.controller.ts]
  //     → prisma.notification.findMany({ userId, orderBy: createdAt desc })
  // ← setNotifications(data) → แสดงใน dropdown
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error('โหลดแจ้งเตือนไม่สำเร็จ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) loadNotifications();
    setIsOpen(!isOpen);
  };

  // handleRead → notificationService.markAsRead(id)
  //   → PATCH /api/notifications/:id/read [backend]
  //     → prisma.notification.update({ isRead: true })
  // ← navigate ตาม type: new_booking_pending → /admin/bookings, อื่นๆ → /my-bookings
  const handleRead = async (notif: Notification) => {
    if (!notif.isRead) {
     await notificationService.markAsRead(notif.id);
      loadUnreadCount();
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    // นำทางตาม type
    if (notif.type === 'new_booking_pending') {
      navigate('/admin/bookings?status=pending');
    } else {
      navigate('/my-bookings');
    }
    setIsOpen(false);
  };

  const handleReadAll = async () => {
    await notificationService.markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    loadUnreadCount();
  };

  const getTypeConfig = (type: string) => {
  const config: Record<string, { icon: React.ReactNode; color: string }> = {
      booking_approved: {
        color: 'text-emerald-500 bg-emerald-50',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      booking_rejected: {
        color: 'text-red-500 bg-red-50',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      new_booking_pending: {
        color: 'text-amber-500 bg-amber-50',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      booking_reminder: {
        color: 'text-sky-500 bg-sky-50',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        ),
      },
    };
    return config[type] || config.booking_reminder;
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'เมื่อสักครู่';
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition"
      >
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-rose-500/30 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <p className="text-slate-400 text-xs">ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const typeConfig = getTypeConfig(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleRead(notif)}
                   className={`group flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-slate-50 border-b border-slate-50 ${
                      !notif.isRead ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeConfig.color}`}>
                      {typeConfig.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-medium truncate ${!notif.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                          {notif.title}
                        </p>
                        {/* Delete */}
                        <button
                          onClick={(e) => handleDelete(e, notif.id)}
                          className="text-slate-300 hover:text-red-400 transition shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${!notif.isRead ? 'text-slate-600' : 'text-slate-400'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {/* Unread dot */}
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;