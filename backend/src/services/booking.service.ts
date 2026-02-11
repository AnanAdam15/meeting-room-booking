import * as emailService from './email.service';
import prisma from '../config/db';
import {
  CreateBookingInput,
  UpdateBookingInput,
  ApproveBookingInput,
} from '../types/booking.types';

// ตรวจสอบว่าห้องว่างในช่วงเวลาที่ต้องการจองหรือไม่
export const checkRoomAvailability = async (
  roomId: string,
  startDatetime: Date,
  endDatetime: Date,
  excludeBookingId?: string
) => {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { notIn: ['cancelled', 'rejected'] },
      OR: [
        {
          // กรณี 1: เวลาเริ่มต้นอยู่ในช่วงที่มีการจองอยู่แล้ว
          startDatetime: { lt: endDatetime },
          endDatetime: { gt: startDatetime },
        },
      ],
    },
  });
  return !conflictingBooking;
};

// สร้างการจองใหม่
export const createBooking = async (userId: string, input: CreateBookingInput) => {
  const startDatetime = new Date(input.startDatetime);
  const endDatetime = new Date(input.endDatetime);

  const isAvailable = await checkRoomAvailability(
    input.roomId,
    startDatetime,
    endDatetime
  );

  if (!isAvailable) {
    throw new Error('ห้องประชุมไม่ว่างในช่วงเวลาที่เลือก');
  }

  const booking = await prisma.booking.create({
    data: {
      title: input.title,
      description: input.description,
      startDatetime,
      endDatetime,
      userId,
      roomId: input.roomId,
      equipments: input.equipments && input.equipments.length > 0 ? {
        createMany: {
          data: input.equipments.map((e) => ({
            equipmentId: e.equipmentId,
            quantity: e.quantity || 1,
          })),
        },
      } : undefined,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      room: {
        select: { id: true, name: true, location: true },
      },
      equipments: {
        include: { equipment: true },
      },
    },
  });

  // ส่งอีเมลแจ้ง admin 
  try {
    const admins = await prisma.user.findMany({
      where: { type: 'admin', status: 'active' },
      select: { email: true },
    });
    const booker = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    for (const admin of admins) {
      await emailService.sendNewBookingNotification(
        admin.email,
        `${booker?.firstName} ${booker?.lastName}`,
        input.title,
        booking.room.name,
        startDatetime,
        endDatetime
      );
    }
  } catch (emailError) {
    console.error('ส่งอีเมลแจ้งเตือนไม่สำเร็จ:', emailError);
  }

  return booking;
};

// ดึงการจองทั้งหมด
export const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      room: {
        select: { id: true, name: true, location: true },
      },
      approver: {
        select: { id: true, firstName: true, lastName: true },
      },
      equipments: {
        include: { equipment: true },
     },
    },
    orderBy: { startDatetime: 'asc' },
  });
  return bookings;
};

// ดึงการจองตาม ID
export const getBookingById = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      room: {
        select: { id: true, name: true, location: true, capacity: true },
      },
      approver: {
        select: { id: true, firstName: true, lastName: true },
      },
      equipments: {
      include: { equipment: true },
      },
    },
  });
  return booking;
};

// ดึงการจองของ user คนนั้น
export const getBookingsByUserId = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      room: {
        select: { id: true, name: true, location: true },
      },
      approver: {
        select: { id: true, firstName: true, lastName: true },
      },
      equipments: {
      include: { equipment: true },
      },
    },
    orderBy: { startDatetime: 'desc' },
  });
  return bookings;
};

// ดึงการจองตามห้อง
export const getBookingsByRoomId = async (roomId: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: { notIn: ['cancelled', 'rejected'] },
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { startDatetime: 'asc' },
  });
  return bookings;
};

// อัพเดทการจอง
export const updateBooking = async (
  id: string,
  userId: string,
  input: UpdateBookingInput
) => {
  // ตรวจสอบว่าเป็นเจ้าของการจองหรือไม่
  const existingBooking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!existingBooking) {
    throw new Error('ไม่พบการจองนี้');
  }

  if (existingBooking.userId !== userId) {
    throw new Error('คุณไม่มีสิทธิ์แก้ไขการจองนี้');
  }

  if (existingBooking.status !== 'pending') {
    throw new Error('ไม่สามารถแก้ไขการจองที่ถูกอนุมัติหรือปฏิเสธแล้ว');
  }

  // ถ้ามีการเปลี่ยนเวลา ต้องตรวจสอบว่าห้องว่างหรือไม่
  if (input.startDatetime || input.endDatetime) {
    const startDatetime = input.startDatetime
      ? new Date(input.startDatetime)
      : existingBooking.startDatetime;
    const endDatetime = input.endDatetime
      ? new Date(input.endDatetime)
      : existingBooking.endDatetime;

    const isAvailable = await checkRoomAvailability(
      existingBooking.roomId,
      startDatetime,
      endDatetime,
      id // exclude current booking
    );

    if (!isAvailable) {
      throw new Error('ห้องประชุมไม่ว่างในช่วงเวลาที่เลือก');
    }
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      startDatetime: input.startDatetime
        ? new Date(input.startDatetime)
        : undefined,
      endDatetime: input.endDatetime ? new Date(input.endDatetime) : undefined,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      room: {
        select: { id: true, name: true, location: true },
      },
    },
  });
  return booking;
};

// ยกเลิกการจอง (โดย user เจ้าของ)
export const cancelBooking = async (id: string, userId: string) => {
  const existingBooking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!existingBooking) {
    throw new Error('ไม่พบการจองนี้');
  }

  if (existingBooking.userId !== userId) {
    throw new Error('คุณไม่มีสิทธิ์ยกเลิกการจองนี้');
  }

  if (existingBooking.status === 'cancelled') {
    throw new Error('การจองนี้ถูกยกเลิกไปแล้ว');
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: 'cancelled' },
  });
  return booking;
};

// อนุมัติ/ปฏิเสธการจอง (โดย admin หรือ manager)
export const approveBooking = async (
  id: string,
  approverId: string,
  input: ApproveBookingInput
) => {
  const existingBooking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!existingBooking) {
    throw new Error('ไม่พบการจองนี้');
  }

  if (existingBooking.status !== 'pending') {
    throw new Error('การจองนี้ถูกดำเนินการไปแล้ว');
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status: input.status,
      approverId,
      approvedAt: new Date(),
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      room: {
        select: { id: true, name: true, location: true },
      },
      approver: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
 // ส่งอีเมลแจ้ง user
  try {
    if (input.status === 'approved') {
      await emailService.sendBookingApproved(
        booking.user.email,
        `${booking.user.firstName} ${booking.user.lastName}`,
        booking.title,
        booking.room.name,
        booking.startDatetime,
        booking.endDatetime
      );
    } else if (input.status === 'rejected') {
      await emailService.sendBookingRejected(
        booking.user.email,
        `${booking.user.firstName} ${booking.user.lastName}`,
        booking.title,
        booking.room.name,
        booking.startDatetime,
        booking.endDatetime
      );
    }
  } catch (emailError) {
    console.error('ส่งอีเมลแจ้งเตือนไม่สำเร็จ:', emailError);
  }

  return booking;
  
};



// ลบการจอง (โดย admin เท่านั้น)
export const deleteBooking = async (id: string) => {
  const existingBooking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!existingBooking) {
    throw new Error('ไม่พบการจองนี้');
  }

  await prisma.booking.delete({
    where: { id },
  });
};