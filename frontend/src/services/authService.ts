import api from './api';
import type { LoginInput, LoginResponse } from '../types/auth';

// ส่งอีเมล + รหัสผ่านไปยัง backend — ได้รับ JWT token และข้อมูล user กลับมา
export const login = async (input: LoginInput): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', input);
  return response.data;
};

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position?: string;
  departmentId?: string;
}

// สมัครสมาชิกใหม่ — user กรอกข้อมูลเองแล้วส่งไป backend
export const register = async (input: RegisterInput): Promise<LoginResponse> => {
  const response = await api.post('/auth/register', input);
  return response.data;
};