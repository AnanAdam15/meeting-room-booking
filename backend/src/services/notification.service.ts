import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ดึงแจ้งเตือนของ user
export const getNotifications = async (userId: string, limit = 20) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      booking: {
        select: {
          id: true,
          title: true,
          status: true,
          room: { select: { name: true } },
        },
      },
    },
  });
};

// นับแจ้งเตือนที่ยังไม่อ่าน
export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};

// อ่านแจ้งเตือน (mark as read)
export const markAsRead = async (id: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

// อ่านทั้งหมด
export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

// ลบแจ้งเตือน
export const deleteNotification = async (id: string, userId: string) => {
  return prisma.notification.deleteMany({
    where: { id, userId },
  });
};

// ===== สร้างแจ้งเตือนอัตโนมัติ =====

// แจ้ง Admin/Approver เมื่อมีการจองใหม่
export const notifyNewBooking = async (bookingId: string, bookingTitle: string, roomName: string, bookerName: string) => {
  // หา admin + approver ทั้งหมด
  const adminsAndApprovers = await prisma.user.findMany({
    where: {
      type: { in: ['admin', 'approver'] },
      status: 'active',
    },
    select: { id: true },
  });

  if (adminsAndApprovers.length === 0) return;

  const notifications = adminsAndApprovers.map((user) => ({
    type: 'new_booking_pending',
    title: 'คำขอจองใหม่',
    message: `${bookerName} ขอจองห้อง ${roomName} - "${bookingTitle}"`,
    userId: user.id,
    bookingId,
  }));

  await prisma.notification.createMany({ data: notifications });
};

// แจ้งผู้จอง เมื่อการจองถูกอนุมัติ
export const notifyBookingApproved = async (bookingId: string, bookingTitle: string, roomName: string, userId: string) => {
  await prisma.notification.create({
    data: {
      type: 'booking_approved',
      title: 'การจองได้รับการอนุมัติ',
      message: `การจอง "${bookingTitle}" ห้อง ${roomName} ได้รับการอนุมัติแล้ว`,
      userId,
      bookingId,
    },
  });
};

// แจ้งผู้จอง เมื่อการจองถูกปฏิเสธ
export const notifyBookingRejected = async (bookingId: string, bookingTitle: string, roomName: string, userId: string, reason?: string) => {
  const reasonText = reason ? ` เหตุผล: ${reason}` : '';
  await prisma.notification.create({
    data: {
      type: 'booking_rejected',
      title: 'การจองถูกปฏิเสธ',
      message: `การจอง "${bookingTitle}" ห้อง ${roomName} ถูกปฏิเสธ${reasonText}`,
      userId,
      bookingId,
    },
  });
};

// แจ้งเตือนก่อนเวลาประชุม
export const notifyBookingReminder = async (bookingId: string, bookingTitle: string, roomName: string, userId: string, minutesBefore: number) => {
  await prisma.notification.create({
    data: {
      type: 'booking_reminder',
      title: 'เตือนการประชุม',
      message: `การประชุม "${bookingTitle}" ห้อง ${roomName} จะเริ่มในอีก ${minutesBefore} นาที`,
      userId,
      bookingId,
    },
  });
};

// ดึง booking ที่ใกล้ถึงเวลา (สำหรับ cron job)
export const getUpcomingBookings = async (minutesBefore: number) => {
  const now = new Date();
  const targetTime = new Date(now.getTime() + minutesBefore * 60 * 1000);

  // หา booking ที่จะเริ่มในช่วง now ถึง targetTime
  return prisma.booking.findMany({
    where: {
      status: 'approved',
      startDatetime: {
        gte: now,
        lte: targetTime,
      },
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      room: { select: { name: true } },
    },
  });
};