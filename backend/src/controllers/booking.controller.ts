import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import '../middlewares/auth.middleware';

// createBooking → bookingService.createBooking(userId, body) [services/booking.service.ts]
//   → validate (title, roomId, startDatetime, endDatetime, ไม่ย้อนหลัง)
//   → checkRoomAvailability() → prisma.booking.findFirst({ overlap })
//   → prisma.booking.create() + prisma.bookingEquipment.createMany()
//   → emailService.sendNewBookingNotification() → Nodemailer ส่งอีเมล admin
//   → notificationService.notifyNewBooking() → prisma.notification.createMany(admins)
// ← return booking data
export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const booking = await bookingService.createBooking(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'สร้างการจองสำเร็จ',
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างการจอง';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// getAllBookings → bookingService.getAllBookings()
//   → prisma.booking.findMany() include user, room, approver, equipments
//   (route ถูก protect ด้วย authenticate + authorize('admin','approver'))
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingService.getAllBookings();

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
    });
  }
};

// ดึงการจองตาม ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการจองนี้',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
    });
  }
};

// getMyBookings → bookingService.getBookingsByUserId(req.user.userId)
//   → prisma.booking.findMany({ where: { userId } }) เรียงจากใหม่→เก่า
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const bookings = await bookingService.getBookingsByUserId(userId);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
    });
  }
};

// ดึงการจองตามห้อง
export const getBookingsByRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId as string;
    const { date } = req.query;
    const bookings = await bookingService.getBookingsByRoomId(roomId, date as string);
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง',
    });
  }
};

// updateBooking → bookingService.updateBooking(id, userId, body)
//   → เช็คว่า booking มีอยู่จริง
//   → เช็คว่า userId ตรงกับเจ้าของ
//   → เช็ค status === 'pending' (ห้ามแก้ approved/rejected)
//   → ถ้าเปลี่ยนเวลา → checkRoomAvailability() (exclude ตัวเอง)
//   → prisma.booking.update()
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const booking = await bookingService.updateBooking(id, userId, req.body);

    res.json({
      success: true,
      message: 'อัพเดทการจองสำเร็จ',
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพเดทการจอง';
    res.status(400).json({
      success: false,
      message,
    }); 
  }
};

// cancelBooking → bookingService.cancelBooking(id, userId)
//   → เช็ค booking มีอยู่ + เจ้าของตรง + ยังไม่ cancelled
//   → prisma.booking.update({ status: 'cancelled' })
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const booking = await bookingService.cancelBooking(id, userId);

    res.json({
      success: true,
      message: 'ยกเลิกการจองสำเร็จ',
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการยกเลิกการจอง';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// approveBooking → bookingService.approveBooking(id, approverId, body)
//   → เช็ค booking มีอยู่ + status === 'pending'
//   → prisma.booking.update({ status, approverId, approvedAt })
//   → (approved) emailService.sendBookingApproved() + notificationService.notifyBookingApproved()
//   → (rejected) emailService.sendBookingRejected(reason) + notificationService.notifyBookingRejected()
//   (email/notification เป็น fire & forget ไม่ block response)
export const approveBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const approverId = req.user!.userId;
    const booking = await bookingService.approveBooking(id, approverId, req.body);

    const actionText = req.body.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
    res.json({
      success: true,
      message: `${actionText}การจองสำเร็จ`,
      data: booking,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดำเนินการ';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// deleteBooking → bookingService.deleteBooking(id)
//   → เช็ค booking มีอยู่
//   → prisma.booking.delete() (ลบถาวร ไม่ใช่ soft delete)
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await bookingService.deleteBooking(id);

    res.json({
      success: true,
      message: 'ลบการจองสำเร็จ',
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบการจอง';
    res.status(400).json({
      success: false,
      message,
    });
  }
};

// ทดสอบส่งอีเมลเตือนการประชุม
export const testSendReminder = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'ไม่พบการจองนี้' });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'การจองนี้ยังไม่ได้รับการอนุมัติ' });
    }

    const emailService = await import('../services/email.service');
    await emailService.sendMeetingReminder(
      booking.user.email,
      `${booking.user.firstName} ${booking.user.lastName}`,
      booking.title,
      booking.room.name,
      booking.startDatetime
    );

    res.json({ success: true, message: `ส่งอีเมลเตือนไปที่ ${booking.user.email} สำเร็จ` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    res.status(500).json({ success: false, message });
  }
};