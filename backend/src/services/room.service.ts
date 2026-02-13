import prisma from '../config/db';
import { CreateRoomInput, UpdateRoomInput } from '../types/room.types';
import * as emailService from './email.service';

// สร้างห้องใหม่
export const createRoom = async (input: CreateRoomInput) => {
  const room = await prisma.meetingRoom.create({
    data: {
      name: input.name,
      location: input.location,
      capacity: input.capacity,
      description: input.description,
      image: input.image,
      managerId: input.managerId,
    },
  });
  return room;
};

// ดึงห้องทั้งหมด
export const getAllRooms = async () => {
  const rooms = await prisma.meetingRoom.findMany({
    include: {
      manager: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
  return rooms;
};

// ดึงห้องตาม ID
export const getRoomById = async (id: string) => {
  const room = await prisma.meetingRoom.findUnique({
    where: { id },
    include: {
      manager: {
        select: { id: true, firstName: true, lastName: true },
      },
      equipments: {
        include: { equipment: true },
      },
    },
  });
  return room;
};

// อัพเดทห้อง
export const updateRoom = async (id: string, input: UpdateRoomInput) => {
  const room = await prisma.meetingRoom.update({
    where: { id },
    data: input,
  });
  return room;
};

// ลบห้อง (ลบข้อมูลที่เกี่ยวข้องก่อน)
export const deleteRoom = async (id: string) => {
  // 1. ลบอุปกรณ์ในห้อง
  await prisma.roomEquipment.deleteMany({ where: { roomId: id } });

  // 2. หา bookings ที่ยังไม่ผ่าน (pending/approved) เพื่อแจ้ง user
  const activeBookings = await prisma.booking.findMany({
    where: {
      roomId: id,
      status: { in: ['pending', 'approved'] },
      startDatetime: { gte: new Date() },
    },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      room: { select: { name: true } },
    },
  });

  // 3. ส่งอีเมลแจ้ง users ที่ได้รับผลกระทบ
  for (const booking of activeBookings) {
    try {
      await emailService.sendBookingRejected(
        booking.user.email,
        `${booking.user.firstName} ${booking.user.lastName}`,
        booking.title,
        booking.room.name,
        booking.startDatetime,
        booking.endDatetime
      );
    } catch (err) {
      console.error('ส่งอีเมลแจ้งเตือนไม่สำเร็จ:', err);
    }
  }

  // 4. หา bookingIds ทั้งหมดเพื่อลบ booking_equipments
  const bookings = await prisma.booking.findMany({
    where: { roomId: id },
    select: { id: true },
  });
  const bookingIds = bookings.map((b) => b.id);

  if (bookingIds.length > 0) {
    await prisma.bookingEquipment.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });
  }

  // 5. ลบการจองทั้งหมด
  await prisma.booking.deleteMany({ where: { roomId: id } });

  // 6. ลบห้อง
  await prisma.meetingRoom.delete({ where: { id } });
};

