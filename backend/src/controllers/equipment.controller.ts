import { Request, Response } from 'express';
import prisma from '../config/db';

// ดึงอุปกรณ์ทั้งหมด
export const getAllEquipments = async (req: Request, res: Response) => {
  try {
    const equipments = await prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: equipments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// เพิ่มอุปกรณ์ใหม่
export const createEquipment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const equipment = await prisma.equipment.create({
      data: { name },
    });
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// ลบอุปกรณ์
export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.equipment.delete({ where: { id } });
    res.json({ success: true, message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// ดึงอุปกรณ์ของห้อง
export const getRoomEquipments = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId as string;
    const equipments = await prisma.roomEquipment.findMany({
      where: { roomId },
      include: { equipment: true },
    });
    res.json({ success: true, data: equipments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// เพิ่มอุปกรณ์ให้ห้อง
export const setRoomEquipments = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.roomId as string;
    const { equipments } = req.body;

    await prisma.roomEquipment.deleteMany({ where: { roomId } });

    if (equipments && equipments.length > 0) {
      await prisma.roomEquipment.createMany({
        data: equipments.map((e: any) => ({
          roomId,
          equipmentId: e.equipmentId,
          quantity: e.quantity || 1,
        })),
      });
    }

    const updated = await prisma.roomEquipment.findMany({
      where: { roomId },
      include: { equipment: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};