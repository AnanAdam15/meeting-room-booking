import { Request, Response } from 'express';
import prisma from '../config/db';

// รายงานสรุปการใช้งานห้องประชุม
export const getRoomUsageReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // ถ้าไม่ระบุวันที่ ใช้เดือนปัจจุบัน
    const start = startDate
      ? new Date(`${startDate}T00:00:00`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate
      ? new Date(`${endDate}T23:59:59`)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // ดึงการจองทั้งหมดในช่วงเวลา
    const bookings = await prisma.booking.findMany({
      where: {
        startDatetime: { gte: start },
        endDatetime: { lte: end },
        status: { in: ['approved', 'pending'] },
      },
      include: {
        room: { select: { id: true, name: true, location: true, capacity: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // ดึงห้องทั้งหมด
    const rooms = await prisma.meetingRoom.findMany({
      select: { id: true, name: true, location: true, capacity: true },
    });

    // สรุปข้อมูลแต่ละห้อง
    const roomStats = rooms.map((room) => {
      const roomBookings = bookings.filter((b) => b.roomId === room.id);

      // คำนวณชั่วโมงการใช้งาน
      const totalHours = roomBookings.reduce((sum, b) => {
        const hours = (new Date(b.endDatetime).getTime() - new Date(b.startDatetime).getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      return {
        roomId: room.id,
        roomName: room.name,
        location: room.location,
        capacity: room.capacity,
        totalBookings: roomBookings.length,
        totalHours: Math.round(totalHours * 10) / 10,
        approvedBookings: roomBookings.filter((b) => b.status === 'approved').length,
        pendingBookings: roomBookings.filter((b) => b.status === 'pending').length,
      };
    });

    // สรุปรวม
    const summary = {
      period: { start, end },
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      totalHours: Math.round(roomStats.reduce((sum, r) => sum + r.totalHours, 0) * 10) / 10,
      roomStats: roomStats.sort((a, b) =>
        b.totalBookings - a.totalBookings || b.totalHours - a.totalHours
      ),
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างรายงาน',
    });
  }
};