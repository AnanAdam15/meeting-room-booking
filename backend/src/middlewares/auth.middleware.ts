import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

// เพิ่ม user ใน Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// authenticate → ดึง Authorization: Bearer <token> จาก header
//   → jwt.verify(token, JWT_SECRET) decode payload
//   → req.user = { userId, email, type }
//   → next() ← ส่งต่อไป controller
//   หรือ return 401 ถ้าไม่มี / token ผิด / หมดอายุ
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. ดึง token จาก header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    // 2. แยก token ออกมา
    const token = authHeader.split(' ')[1];

    // 3. ตรวจสอบ token
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // 4. เก็บข้อมูล user ไว้ใน request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Middleware ตรวจสอบ Token แบบ Optional (ไม่ error ถ้าไม่มี token)
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET as string;
      req.user = jwt.verify(token, secret) as JwtPayload;
    }
  } catch {
    // ไม่มี token หรือ token ไม่ถูกต้อง ไม่ต้องทำอะไร
  }
  next();
};

// authorize(...roles) → เช็ค req.user.type อยู่ใน roles ที่อนุญาตไหม
//   → ถ้าใช่ → next()
//   → ถ้าไม่ใช่ → return 403 Forbidden
// ใช้งาน: router.get('/path', authenticate, authorize('admin','approver'), controller)
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    next();
  };
};