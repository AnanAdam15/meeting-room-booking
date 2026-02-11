import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/equipments - ดึงอุปกรณ์ทั้งหมด
router.get('/', equipmentController.getAllEquipments);

// POST /api/equipments - เพิ่มอุปกรณ์ (admin)
router.post('/', authenticate, authorize('admin'), equipmentController.createEquipment);

// DELETE /api/equipments/:id - ลบอุปกรณ์ (admin)
router.delete('/:id', authenticate, authorize('admin'), equipmentController.deleteEquipment);

// GET /api/equipments/room/:roomId - ดึงอุปกรณ์ของห้อง
router.get('/room/:roomId', equipmentController.getRoomEquipments);

// PUT /api/equipments/room/:roomId - ตั้งค่าอุปกรณ์ห้อง (admin)
router.put('/room/:roomId', authenticate, authorize('admin', 'room_manager'), equipmentController.setRoomEquipments);

export default router;