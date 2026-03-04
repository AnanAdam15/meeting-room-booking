import api from './api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  bookingId: string | null;
  createdAt: string;
  booking?: {
    id: string;
    title: string;
    status: string;
    room: { name: string };
  };
}

// ดึงแจ้งเตือนทั้งหมด
export const getMyNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

// นับแจ้งเตือนที่ยังไม่อ่าน
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

// อ่านแจ้งเตือน
export const markAsRead = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

// อ่านทั้งหมด
export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

// ลบแจ้งเตือน
export const deleteNotification = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};