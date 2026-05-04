import { Request, Response } from 'express';
import prisma from '../config/db';

// getAllUsers → prisma.user.findMany() select ฟิลด์สำคัญ ไม่ include password
//   เรียงจากใหม่→เก่า (createdAt desc)
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


// updateUser → validate (email, phone ถ้าส่งมา)
//   → phone ?? null / position ?? null  ← null = ล้างค่าเดิม, undefined = ข้าม Prisma update
//   → ไม่อนุญาตให้ Admin เปลี่ยน password ของ user
//   → prisma.user.update({ where: { id } })
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { email, firstName, lastName, phone, position, type, status, departmentId } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' });
        return;
      }
    }
    if (phone && !/^[0-9+\-\s()]{9,15}$/.test(phone)) {
      res.status(400).json({ success: false, message: 'รูปแบบเบอร์โทรไม่ถูกต้อง' });
      return;
    }

    const data: any = {
      email, firstName, lastName, type, status, departmentId,
      phone: phone ?? null,
      position: position ?? null,
    };

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

// getUserDependencies → prisma.meetingRoom.findMany({ managerId })  ← ห้องที่ดูแลอยู่
//                     → prisma.booking.count({ userId, status: pending/approved })
// ← frontend ใช้ข้อมูลนี้แสดงใน modal ก่อนปิดใช้งาน
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

// deactivateUser → เช็ค managingRooms + activeBookings อีกรอบ (ป้องกัน race condition)
//   → ถ้ายังมี dependency → return 400
//   → prisma.user.update({ status: 'inactive' })  ← soft deactivate ไม่ลบข้อมูล
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

// activateUser → prisma.user.update({ status: 'active' })
export const activateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.update({ where: { id }, data: { status: 'active' } });
    res.json({ success: true, message: 'เปิดการใช้งานผู้ใช้สำเร็จ' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};