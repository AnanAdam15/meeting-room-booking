import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// ดึงแจ้งเตือนของตัวเอง
// GET /api/notifications
router.get('/', authenticate, notificationController.getMyNotifications);

// นับแจ้งเตือนที่ยังไม่อ่าน
// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// อ่านทั้งหมด
// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// อ่านแจ้งเตือนรายตัว
// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// ลบแจ้งเตือน
// DELETE /api/notifications/:id
router.delete('/:id', authenticate, notificationController.deleteNotification);

export default router;