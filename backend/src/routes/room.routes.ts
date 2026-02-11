import { Router } from 'express';
import * as roomController from '../controllers/room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// GET /api/rooms - ดึงห้องทั้งหมด (ทุกคนดูได้)
router.get('/', roomController.getAllRooms);

// GET /api/rooms/:id - ดึงห้องตาม ID
router.get('/:id', roomController.getRoomById);

// POST /api/rooms - สร้างห้องใหม่ (admin, room_manager เท่านั้น)
router.post('/', authenticate, authorize('admin', 'room_manager'), roomController.createRoom);

// PUT /api/rooms/:id - อัพเดทห้อง (admin, room_manager เท่านั้น)
router.put('/:id', authenticate, authorize('admin', 'room_manager'), roomController.updateRoom);

// DELETE /api/rooms/:id - ลบห้อง (admin เท่านั้น)
router.delete('/:id', authenticate, authorize('admin'), roomController.deleteRoom);

// POST /api/rooms/:id/upload - อัพโหลดรูปห้อง (admin, room_manager)
router.post(
  '/:id/upload',
  authenticate,
  authorize('admin', 'room_manager'),
  upload.single('image'),
  roomController.uploadRoomImage
);

export default router;