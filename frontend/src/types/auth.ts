// ข้อมูล User ที่ได้จาก API
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  type: 'admin' | 'staff' | 'approver';
}

// ข้อมูลที่ส่งไป Login
export interface LoginInput {
  email: string;
  password: string;
}

// Response จาก Login API
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}