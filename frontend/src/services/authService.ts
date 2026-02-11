import api from './api';
import type { LoginInput, LoginResponse } from '../types/auth';

export const login = async (input: LoginInput): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', input);
  return response.data;
};