import api from './api';
import type { ApiResponse } from '../types/api';

export interface Equipment {
  id: string;
  name: string;
}

export interface RoomEquipment {
  roomId: string;
  equipmentId: string;
  quantity: number;
  equipment: Equipment;
}

// ดึงอุปกรณ์ทั้งหมด
export const getAllEquipments = async (): Promise<ApiResponse<Equipment[]>> => {
  const response = await api.get('/equipments');
  return response.data;
};

// เพิ่มอุปกรณ์
export const createEquipment = async (name: string): Promise<ApiResponse<Equipment>> => {
  const response = await api.post('/equipments', { name });
  return response.data;
};

// ลบอุปกรณ์
export const deleteEquipment = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete(`/equipments/${id}`);
  return response.data;
};

// ดึงอุปกรณ์ของห้อง
export const getRoomEquipments = async (roomId: string): Promise<ApiResponse<RoomEquipment[]>> => {
  const response = await api.get(`/equipments/room/${roomId}`);
  return response.data;
};

// ตั้งค่าอุปกรณ์ห้อง
export const setRoomEquipments = async (
  roomId: string,
  equipments: { equipmentId: string; quantity: number }[]
): Promise<ApiResponse<RoomEquipment[]>> => {
  const response = await api.put(`/equipments/room/${roomId}`, { equipments });
  return response.data;
};