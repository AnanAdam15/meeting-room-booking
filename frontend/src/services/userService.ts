import api from './api';
import type { ApiResponse } from '../types/api';

export interface UserData {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  type: string;
  position: string | null;
  firstName: string;
  lastName: string;
  departmentId: string;
  department: { id: string; name: string };
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position?: string;
  type?: string;
  departmentId: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null
  position?: string | null;
  type?: string;
  status?: string;
  departmentId?: string;
}

// ดึงผู้ใช้ทั้งหมด (admin เท่านั้น)
export const getAllUsers = async (): Promise<ApiResponse<UserData[]>> => {
  const response = await api.get('/users');
  return response.data;
};

// สร้างผู้ใช้ใหม่
export const createUser = async (input: CreateUserInput): Promise<ApiResponse<UserData>> => {
  const response = await api.post('/users', input);
  return response.data;
};

// อัพเดทข้อมูลผู้ใช้
export const updateUser = async (id: string, input: UpdateUserInput): Promise<ApiResponse<UserData>> => {
  const response = await api.put(`/users/${id}`, input);
  return response.data;
};

// ตรวจสอบข้อมูลที่เกี่ยวข้องก่อนลบ/ปิดใช้งาน (ห้องที่ดูแล, การจองที่ยังไม่สิ้นสุด)
export const getUserDependencies = async (id: string): Promise<ApiResponse<{ managingRooms: { id: string; name: string }[]; activeBookings: number }>> => {
  const response = await api.get(`/users/${id}/dependencies`);
  return response.data;
};

// ปิดใช้งานผู้ใช้ (soft delete — ไม่ลบข้อมูล)
export const deactivateUser = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch(`/users/${id}/deactivate`);
  return response.data;
};

// เปิดใช้งานผู้ใช้อีกครั้ง
export const activateUser = async (id: string): Promise<ApiResponse> => {
  const response = await api.patch(`/users/${id}/activate`);
  return response.data;
};