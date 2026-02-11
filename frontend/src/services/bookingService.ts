import api from './api';
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
  ApproveBookingInput,
} from '../types/booking';
import type { ApiResponse } from '../types/api';

// สร้างการจอง
export const createBooking = async (input: CreateBookingInput): Promise<ApiResponse<Booking>> => {
  const response = await api.post('/bookings', input);
  return response.data;
};

// ดูการจองของตัวเอง
export const getMyBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get('/bookings/my');
  return response.data;
};

// ดูการจองตาม ID
export const getBookingById = async (id: string): Promise<ApiResponse<Booking>> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// ดูการจองตามห้อง
export const getBookingsByRoom = async (roomId: string): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get(`/bookings/room/${roomId}`);
  return response.data;
};

// แก้ไขการจอง (เจ้าของ)
export const updateBooking = async (id: string, input: UpdateBookingInput): Promise<ApiResponse<Booking>> => {
  const response = await api.put(`/bookings/${id}`, input);
  return response.data;
};

// ยกเลิกการจอง (เจ้าของ)
export const cancelBooking = async (id: string): Promise<ApiResponse<Booking>> => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};

// ดูการจองทั้งหมด (admin)
export const getAllBookings = async (): Promise<ApiResponse<Booking[]>> => {
  const response = await api.get('/bookings');
  return response.data;
};

// อนุมัติ/ปฏิเสธ (admin)
export const approveBooking = async (id: string, input: ApproveBookingInput): Promise<ApiResponse<Booking>> => {
  const response = await api.patch(`/bookings/${id}/approve`, input);
  return response.data;
};

// ลบการจอง (admin)
export const deleteBooking = async (id: string): Promise<ApiResponse> => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};
