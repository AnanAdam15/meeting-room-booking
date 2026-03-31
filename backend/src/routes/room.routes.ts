import { Router } from 'express';
import * as roomController from '../controllers/room.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// GET /api/rooms - ดึงห้องทั้งหมด (admin/approver เห็นทุกห้อง, user เห็นเฉพาะ available)
router.get('/', optionalAuthenticate, roomController.getAllRooms);

// GET /api/rooms/managers - ดึง user ที่เป็น approver/admin (ต้องอยู่ก่อน /:id)
router.get('/managers', authenticate, roomController.getRoomManagers);

// GET /api/rooms/:id - ดึงห้องตาม ID
router.get('/:id', roomController.getRoomById);

// POST /api/rooms - สร้างห้องใหม่ (admin, approver เท่านั้น)
router.post('/', authenticate, authorize('admin', 'approver'), roomController.createRoom);

// PUT /api/rooms/:id - อัพเดทห้อง (admin, approver เท่านั้น)
router.put('/:id', authenticate, authorize('admin', 'approver'), roomController.updateRoom);

// DELETE /api/rooms/:id - ลบห้อง (admin เท่านั้น)
router.delete('/:id', authenticate, authorize('admin'), roomController.deleteRoom);

// POST /api/rooms/:id/upload - อัพโหลดรูปห้อง (admin, approver)
router.post(
  '/:id/upload',
  authenticate,
  authorize('admin', 'approver'),
  upload.single('image'),
  roomController.uploadRoomImage
);

export default router;