// ข้อมูลการจอง
export interface Booking {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  startDatetime: string;
  endDatetime: string;
  userId: string;
  roomId: string;
  approverId: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  room?: {
    id: string;
    name: string;
    location: string;
    capacity?: number;
  };
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  equipments?: {
    equipmentId: string;
    quantity: number;
    equipment: { id: string; name: string };
  }[];
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
}


// ข้อมูลสำหรับสร้างการจอง
export interface CreateBookingInput {
  title: string;
  description?: string;
  startDatetime: string;
  endDatetime: string;
  roomId: string;
  equipments?: { equipmentId: string; quantity: number }[];
}
// ข้อมูลสำหรับแก้ไขการจอง
export interface UpdateBookingInput {
  title?: string;
  description?: string;
  startDatetime?: string;
  endDatetime?: string;
}

// ข้อมูลสำหรับอนุมัติ/ปฏิเสธ
export interface ApproveBookingInput {
  status: 'approved' | 'rejected';
  reason?: string;  // เพิ่มเหตุผลสำหรับการปฏิเสธ
}