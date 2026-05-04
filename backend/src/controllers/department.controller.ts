import { Request, Response } from 'express';
import prisma from '../config/db';

// ดึงแผนกทั้งหมด (เฉพาะที่ยังใช้งานอยู่)
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// สร้างแผนกใหม่
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'กรุณากรอกชื่อแผนก' });
      return;
    }
    const existing = await prisma.department.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' }, isActive: true },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'ชื่อแผนกนี้มีอยู่ในระบบแล้ว' });
      return;
    }
    const department = await prisma.department.create({ data: { name: name.trim() } });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// แก้ไขแผนก
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'กรุณากรอกชื่อแผนก' });
      return;
    }
    const existing = await prisma.department.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' }, isActive: true, id: { not: id } },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'ชื่อแผนกนี้มีอยู่ในระบบแล้ว' });
      return;
    }
    const department = await prisma.department.update({
      where: { id },
      data: { name: name.trim() },
    });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// ลบแผนก (soft delete — ข้อมูลยังอยู่ใน Database)
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // เช็คว่ามี user ในแผนกไหม
    const userCount = await prisma.user.count({ where: { departmentId: id } });
    if (userCount > 0) {
      res.status(400).json({
        success: false,
        message: `ไม่สามารถลบได้ มีผู้ใช้ ${userCount} คนอยู่ในแผนกนี้`,
      });
      return;
    }

    await prisma.department.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'ลบแผนกสำเร็จ' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};