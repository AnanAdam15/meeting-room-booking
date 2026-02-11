import api from './api';
import type { ApiResponse } from '../types/api';

export interface RoomStat {
  roomId: string;
  roomName: string;
  location: string;
  capacity: number;
  totalBookings: number;
  totalHours: number;
  approvedBookings: number;
  pendingBookings: number;
}

export interface RoomUsageReport {
  period: { start: string; end: string };
  totalRooms: number;
  totalBookings: number;
  totalHours: number;
  roomStats: RoomStat[];
}

export const getRoomUsageReport = async (
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<RoomUsageReport>> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await api.get(`/reports/room-usage?${params.toString()}`);
  return response.data;
};