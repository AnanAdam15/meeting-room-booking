// Type สำหรับ Register
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position?: string;
  departmentId: string;
}

// Type สำหรับ Login
export interface LoginInput {
  email: string;
  password: string;
}

// Type สำหรับ JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  type: string; // admin, staff, room_manager
}
