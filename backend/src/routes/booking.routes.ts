import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// ===== Routes สำหรับ Staff (พนักงานโรงพยาบาล) =====

// สร้างการจองใหม่
// POST /api/bookings
router.post('/', authenticate, bookingController.createBooking);

// ดูการจองของตัวเอง
// GET /api/bookings/my
router.get('/my', authenticate, bookingController.getMyBookings);

// ทดสอบส่งการแจ้งเตือน (admin เท่านั้น)
router.post('/test-reminder', authenticate, authorize('admin'), bookingController.testSendReminder);

// ดูการจองตาม ID
// GET /api/bookings/:id
router.get('/:id', authenticate, bookingController.getBookingById);

// ดูการจองตามห้อง (สำหรับแสดง calendar)
// GET /api/bookings/room/:roomId
router.get('/room/:roomId', authenticate, bookingController.getBookingsByRoom);

// แก้ไขการจอง (เฉพาะเจ้าของ + status pending)
// PUT /api/bookings/:id
router.put('/:id', authenticate, bookingController.updateBooking);

// ยกเลิกการจอง (เฉพาะเจ้าของ)
// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);

// ===== Routes สำหรับ Admin + Room Manager =====

// ดูการจองทั้งหมด
// GET /api/bookings
router.get('/', authenticate, authorize('admin', 'approver'), bookingController.getAllBookings);

// อนุมัติ/ปฏิเสธการจอง
// PATCH /api/bookings/:id/approve
router.patch('/:id/approve', authenticate, authorize('admin', 'approver'), bookingController.approveBooking);

// ลบการจอง (admin เท่านั้น)
// DELETE /api/bookings/:id
router.delete('/:id', authenticate, authorize('admin'), bookingController.deleteBooking);

export default router;