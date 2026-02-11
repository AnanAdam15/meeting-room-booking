import prisma from '../config/db';
import { CreateRoomInput, UpdateRoomInput } from '../types/room.types';

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

// ลบห้อง
export const deleteRoom = async (id: string) => {
  await prisma.meetingRoom.delete({
    where: { id },
  });
};