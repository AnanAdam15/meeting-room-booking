import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';

// ดึง user ทั้งหมด
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        type: true,
        position: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// สร้าง user ใหม่
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, position, type, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName || !departmentId) {
      res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    if (phone && !/^[0-9+\-\s()]{9,15}$/.test(phone)) {
      res.status(400).json({ success: false, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ success: false, message: 'อีเมลนี้มีอยู่ในระบบแล้ว' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        position,
        type: type || 'staff',
        departmentId,
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        type: true, status: true, department: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// แก้ไข user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { email, firstName, lastName, phone, position, type, status, departmentId, password } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' });
        return;
      }
    }
    if (password && password.length < 6) {
      res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    if (phone && !/^[0-9+\-\s()]{9,15}$/.test(phone)) {
      res.status(400).json({ success: false, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง' });
      return;
    }

    const data: any = { email, firstName, lastName, phone, position, type, status, departmentId };

    // ถ้าส่ง password มาด้วย ให้ hash ใหม่
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        type: true, status: true, department: { select: { name: true } },
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// เช็ค dependency ก่อน deactivate
export const getUserDependencies = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const managingRooms = await prisma.meetingRoom.findMany({
      where: { managerId: id },
      select: { id: true, name: true },
    });

    const activeBookings = await prisma.booking.count({
      where: { userId: id, status: { in: ['pending', 'approved'] } },
    });

    res.json({ success: true, data: { managingRooms, activeBookings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// ปิดการใช้งาน user (deactivate)
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const managingRooms = await prisma.meetingRoom.findMany({
      where: { managerId: id },
      select: { id: true, name: true },
    });

    const activeBookings = await prisma.booking.count({
      where: { userId: id, status: { in: ['pending', 'approved'] } },
    });

    if (managingRooms.length > 0 || activeBookings > 0) {
      res.status(400).json({
        success: false,
        message: 'ไม่สามารถปิดการใช้งานได้',
        data: { managingRooms, activeBookings },
      });
      return;
    }

    await prisma.user.update({ where: { id }, data: { status: 'inactive' } });
    res.json({ success: true, message: 'ปิดการใช้งานผู้ใช้สำเร็จ' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// เปิดการใช้งาน user (activate)
export const activateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.update({ where: { id }, data: { status: 'active' } });
    res.json({ success: true, message: 'เปิดการใช้งานผู้ใช้สำเร็จ' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};