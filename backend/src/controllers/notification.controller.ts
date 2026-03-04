import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import '../middlewares/auth.middleware';

// ดึงแจ้งเตือนของ user ที่ login อยู่
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notifications = await notificationService.getNotifications(userId);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงแจ้งเตือน',
    });
  }
};

// นับจำนวนแจ้งเตือนที่ยังไม่อ่าน
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// อ่านแจ้งเตือน
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      message: 'อ่านแจ้งเตือนแล้ว',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// อ่านทั้งหมด
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'อ่านแจ้งเตือนทั้งหมดแล้ว',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// ลบแจ้งเตือน
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    await notificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'ลบแจ้งเตือนสำเร็จ',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};