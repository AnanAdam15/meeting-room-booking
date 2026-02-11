import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register - สมัครสมาชิก
router.post('/register', authController.register);

// POST /api/auth/login - เข้าสู่ระบบ
router.post('/login', authController.login);

export default router;