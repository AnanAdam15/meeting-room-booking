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

// ลบ user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // ลบข้อมูลที่เกี่ยวข้อง
    const bookings = await prisma.booking.findMany({
      where: { userId: id },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);

    if (bookingIds.length > 0) {
      await prisma.bookingEquipment.deleteMany({
        where: { bookingId: { in: bookingIds } },
      });
    }
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.booking.updateMany({
      where: { approverId: id },
      data: { approverId: null },
    });
    await prisma.meetingRoom.updateMany({
      where: { managerId: id },
      data: { managerId: null },
    });

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};