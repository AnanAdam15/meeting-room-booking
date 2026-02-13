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
  phone?: string;
  position?: string;
  type?: string;
  status?: string;
  departmentId?: string;
}

export const getAllUsers = async (): Promise<ApiResponse<UserData[]>> => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (input: CreateUserInput): Promise<ApiResponse<UserData>> => {
  const response = await api.post('/users', input);
  return response.data;
};

export const updateUser = async (id: string, input: UpdateUserInput): Promise<ApiResponse<UserData>> => {
  const response = await api.put(`/users/${id}`, input);
  return response.data;
};

export const deleteUser = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};