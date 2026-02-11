import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import '../middlewares/auth.middleware';

// สร้างการจองใหม่
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

// ดึงการจองทั้งหมด (admin)
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

// ดึงการจองของ user ที่ login อยู่
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
    const bookings = await bookingService.getBookingsByRoomId(roomId);

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

// อัพเดทการจอง
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

// ยกเลิกการจอง (โดย user เจ้าของ)
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

// อนุมัติ/ปฏิเสธการจอง (admin/manager)
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

// ลบการจอง (admin)
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