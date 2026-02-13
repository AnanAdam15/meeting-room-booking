import api from './api';
import type { ApiResponse } from '../types/api';

export interface Department {
  id: string;
  name: string;
  _count?: { users: number };
}

export const getAllDepartments = async (): Promise<ApiResponse<Department[]>> => {
  const response = await api.get('/departments');
  return response.data;
};

export const createDepartment = async (name: string): Promise<ApiResponse<Department>> => {
  const response = await api.post('/departments', { name });
  return response.data;
};

export const updateDepartment = async (id: string, name: string): Promise<ApiResponse<Department>> => {
  const response = await api.put(`/departments/${id}`, { name });
  return response.data;
};

export const deleteDepartment = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};