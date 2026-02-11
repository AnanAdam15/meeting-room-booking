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