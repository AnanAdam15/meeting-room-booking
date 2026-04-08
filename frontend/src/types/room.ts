// ข้อมูลห้องประชุม
export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string | null;
  image: string | null;
  status: 'available' | 'unavailable' | 'maintenance';
  managerId: string | null;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  equipments: {
    equipment: {
      id: string;
      name: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

// ข้อมูลสำหรับสร้าง/แก้ไขห้อง
export interface CreateRoomInput {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  image?: string;
  managerId?: string;
}

export interface UpdateRoomInput {
  name?: string;
  location?: string;
  capacity?: number;
  description?: string;
  image?: string;
  status?: string;
  managerId?: string;
}