import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

// register → authService.register(body) [services/auth.service.ts]
//   → validate input (email format, password ≥ 6)
//   → prisma.user.findUnique({ email }) เช็คซ้ำ
//   → bcrypt.hash(password, 10)
//   → prisma.user.create()
//   → generateToken({ userId, email, type })
// ← return { user, token }
export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// login → authService.login(body) [services/auth.service.ts]
//   → prisma.user.findUnique({ email })
//   → bcrypt.compare(password, hash)
//   → เช็ค status === 'active'
//   → generateToken({ userId, email, type }) → jwt.sign() อายุ 7 วัน
// ← return { user, token } → frontend เก็บ token ใน localStorage
export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};