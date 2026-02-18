export interface CreateBookingInput {
  title: string;
  description?: string;
  startDatetime: string;
  endDatetime: string;
  roomId: string;
  equipments?: { equipmentId: string; quantity: number }[];
}

export interface UpdateBookingInput {
  title?: string;
  description?: string;
  startDatetime?: string;
  endDatetime?: string;
  status?: string;
}

export interface ApproveBookingInput {
  status: 'approved' | 'rejected';
  reason?: string;  // เพิ่มเหตุผล
}