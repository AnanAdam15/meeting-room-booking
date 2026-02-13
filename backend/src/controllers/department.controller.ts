import { Request, Response } from 'express';
import prisma from '../config/db';

// ดึงแผนกทั้งหมด
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
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
    const department = await prisma.department.create({ data: { name } });
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
    const department = await prisma.department.update({
      where: { id },
      data: { name },
    });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// ลบแผนก
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

    await prisma.department.delete({ where: { id } });
    res.json({ success: true, message: 'ลบแผนกสำเร็จ' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};