import api from './api';
import type { Room, CreateRoomInput, UpdateRoomInput } from '../types/room';
import type { ApiResponse } from '../types/api';

// ดึงห้องทั้งหมด
export const getAllRooms = async (): Promise<ApiResponse<Room[]>> => {
  const response = await api.get('/rooms');
  return response.data;
};

// ดึงห้องตาม ID
export const getRoomById = async (id: string): Promise<ApiResponse<Room>> => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

// สร้างห้องใหม่ (admin)
export const createRoom = async (input: CreateRoomInput): Promise<ApiResponse<Room>> => {
  const response = await api.post('/rooms', input);
  return response.data;
};

// แก้ไขห้อง (admin)
export const updateRoom = async (id: string, input: UpdateRoomInput): Promise<ApiResponse<Room>> => {
  const response = await api.put(`/rooms/${id}`, input);
  return response.data;
};

// ลบห้อง (admin)
// export const deleteRoom = async (id: string): Promise<ApiResponse> => {
//   const response = await api.delete(`/rooms/${id}`);
//   return response.data;
// };

// อัพโหลดรูปห้อง
export const uploadRoomImage = async (id: string, file: File): Promise<ApiResponse<Room>> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post(`/rooms/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

  // เพิ่ม dropdown ในฟอร์มห้อง
export interface RoomManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
}

export const getRoomManagers = async (): Promise<ApiResponse<RoomManager[]>> => {
  const response = await api.get('/rooms/managers');
  return response.data;
};