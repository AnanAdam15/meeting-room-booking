import * as emailService from './email.service';
import * as notificationService from './notification.service';
import prisma from '../config/db';
import {
  CreateBookingInput,
  UpdateBookingInput,
  ApproveBookingInput,
} from '../types/booking.types';

// checkRoomAvailability(roomId, start, end, excludeBookingId?)
//   → prisma.booking.findFirst({
//       roomId,
//       status: NOT cancelled/rejected,
//       startDatetime < end AND endDatetime > start  ← overlap condition
//     })
//   ← return true (ว่าง) / false (มีการจองชนกัน)
//   excludeBookingId ใช้ตอน update เพื่อไม่ให้ชนกับตัวเอง
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

// createBooking(userId, input)
//   1. validate ข้อมูล + เช็คเวลาไม่ย้อนหลัง
//   2. checkRoomAvailability() ← ถ้าไม่ว่าง throw error
//   3. prisma.booking.create() + prisma.bookingEquipment.createMany()
//   4. (fire & forget) emailService.sendNewBookingNotification() → แจ้ง admin ทุกคน
//   5. (fire & forget) notificationService.notifyNewBooking() → สร้าง notification ให้ admin
export const createBooking = async (userId: string, input: CreateBookingInput) => {
  if (!input.title || !input.roomId || !input.startDatetime || !input.endDatetime) {
    throw new Error('กรุณากรอกข้อมูลให้ครบ (หัวข้อ, ห้อง, วันเวลาเริ่ม-สิ้นสุด)');
  }

  const startDatetime = new Date(input.startDatetime);
  const endDatetime = new Date(input.endDatetime);

  if (isNaN(startDatetime.getTime()) || isNaN(endDatetime.getTime())) {
    throw new Error('รูปแบบวันที่ไม่ถูกต้อง');
  }
  if (startDatetime >= endDatetime) {
    throw new Error('เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด');
  }
  if (startDatetime < new Date()) {
    throw new Error('ไม่สามารถจองเวลาที่ผ่านมาแล้วได้');
  }

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

    await Promise.allSettled(
      admins.map((admin) =>
        emailService.sendNewBookingNotification(
          admin.email,
          `${booker?.firstName} ${booker?.lastName}`,
          input.title,
          booking.room.name,
          startDatetime,
          endDatetime
        )
      )
    );
  } catch (emailError) {
    console.error('ส่งอีเมลแจ้งเตือนไม่สำเร็จ:', emailError);
  }
  // แจ้งเตือนในระบบ
  try {
    await notificationService.notifyNewBooking(
      booking.id,
      booking.title,
      booking.room.name,
      `${booking.user.firstName} ${booking.user.lastName}`
    );
  } catch (notifError) {
    console.error('สร้างแจ้งเตือนไม่สำเร็จ:', notifError);
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
    orderBy: { createdAt: 'desc' },
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
    orderBy: { createdAt: 'desc' },
  });
  return bookings;
};

// ดึงการจองตามห้อง (รองรับ filter วันที่)
export const getBookingsByRoomId = async (roomId: string, date?: string) => {
  const where: any = {
    roomId,
    status: { notIn: ['cancelled', 'rejected'] },
  };

  if (date) {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);
    where.startDatetime = { lt: endOfDay };
    where.endDatetime = { gt: startOfDay };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { startDatetime: 'asc' },
  });
  return bookings;
};

// updateBooking(id, userId, input)
//   1. prisma.booking.findUnique(id) เช็คมีอยู่
//   2. เช็ค userId === booking.userId (เจ้าของเท่านั้น)
//   3. เช็ค status === 'pending' (ห้ามแก้ approved/rejected)
//   4. ถ้าเปลี่ยนเวลา → checkRoomAvailability(excludeBookingId=id)
//   5. prisma.booking.update()
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

// approveBooking(id, approverId, input)
//   1. เช็ค booking มีอยู่ + status === 'pending'
//   2. prisma.booking.update({ status, approverId, approvedAt: now })
//   3. (approved) emailService.sendBookingApproved() + notificationService.notifyBookingApproved()
//      (rejected) emailService.sendBookingRejected(reason) + notificationService.notifyBookingRejected()
//   Promise.allSettled ← ไม่ให้ email/notification failure block response
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
  // ส่งอีเมล + แจ้งเตือนแบบ fire & forget (ไม่ block response)
  const emailPromise = input.status === 'approved'
    ? emailService.sendBookingApproved(
        booking.user.email,
        `${booking.user.firstName} ${booking.user.lastName}`,
        booking.title, booking.room.name,
        booking.startDatetime, booking.endDatetime
      )
    : emailService.sendBookingRejected(
        booking.user.email,
        `${booking.user.firstName} ${booking.user.lastName}`,
        booking.title, booking.room.name,
        booking.startDatetime, booking.endDatetime,
        input.reason
      );

  const notifPromise = input.status === 'approved'
    ? notificationService.notifyBookingApproved(booking.id, booking.title, booking.room.name, booking.user.id)
    : notificationService.notifyBookingRejected(booking.id, booking.title, booking.room.name, booking.user.id, input.reason);

  Promise.allSettled([emailPromise, notifPromise]).catch((e) =>
    console.error('แจ้งเตือนไม่สำเร็จ:', e)
  );

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

