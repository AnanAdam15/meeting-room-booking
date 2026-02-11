import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/reports/room-usage - รายงานสรุปการใช้งาน (admin เท่านั้น)
router.get('/room-usage', authenticate, authorize('admin'), reportController.getRoomUsageReport);

export default router;