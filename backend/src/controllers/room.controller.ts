import { Request, Response } from 'express';
import * as roomService from '../services/room.service';
import prisma from '../config/db';

// สร้างห้องใหม่
export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await roomService.createRoom(req.body);
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ดึงห้องทั้งหมด
export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdminOrManager = !!(req.user && ['admin', 'approver'].includes(req.user.type));
    const rooms = await roomService.getAllRooms(isAdminOrManager);
    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ดึงห้องตาม ID
export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const room = await roomService.getRoomById(id);
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// อัพเดทห้อง
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const room = await roomService.updateRoom(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ลบห้อง
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await roomService.deleteRoom(id);
    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// ดึง user ที่เป็น approver หรือ admin
export const getRoomManagers = async (req: Request, res: Response): Promise<void> => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        type: { in: ['approver', 'admin'] },
        status: 'active',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        type: true,
      },
      orderBy: { firstName: 'asc' },
    });
    res.json({ success: true, data: managers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
  }
};

// อัพโหลดรูปห้อง
export const uploadRoomImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'กรุณาเลือกไฟล์รูปภาพ',
      });
      return;
    }

    // บันทึก path รูปลง DB
    const imagePath = `/uploads/${req.file.filename}`;
    const room = await roomService.updateRoom(id, { image: imagePath });

    res.status(200).json({
      success: true,
      message: 'อัพโหลดรูปสำเร็จ',
      data: room,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

