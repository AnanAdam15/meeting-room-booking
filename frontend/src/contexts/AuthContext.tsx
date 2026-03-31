import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginInput } from '../types/auth';
import * as authService from '../services/authService';

// กำหนดว่า Context จะมีอะไรบ้าง
interface AuthContextType {
  user: User | null;          // ข้อมูล user ที่ login อยู่
  token: string | null;       // JWT token
  isLoading: boolean;         // กำลังโหลดอยู่ไหม
  login: (input: LoginInput) => Promise<void>;   // ฟังก์ชัน login
  logout: () => void;         // ฟังก์ชัน logout
  isAdmin: boolean;           // เป็น admin หรือไม่
  isRoomManager: boolean;
}

// สร้าง Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider ครอบทั้งแอป
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ตอนเปิดแอปครั้งแรก: เช็คว่ามี token เก็บไว้ใน localStorage ไหม
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // ฟังก์ชัน Login
  const login = async (input: LoginInput) => {
    const response = await authService.login(input);

    if (response.success) {
      const { user, token } = response.data;

      // เก็บลง state
      setUser(user);
      setToken(token);

      // เก็บลง localStorage (เพื่อให้ refresh แล้วยังล็อกอินอยู่)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      throw new Error(response.message);
    }
  };

  // ฟังก์ชัน Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // เช็คว่าเป็น admin ไหม
  const isAdmin = user?.type === 'admin';
  const isRoomManager = user?.type === 'approver';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin, isRoomManager }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook สำหรับใช้งาน Auth ในทุก component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};