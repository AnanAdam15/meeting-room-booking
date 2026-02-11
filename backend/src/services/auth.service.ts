import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { RegisterInput, LoginInput, JwtPayload } from '../types/auth.types';

// สร้าง JWT Token
const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign(
    { userId: payload.userId, email: payload.email, type: payload.type },
    secret,
    { expiresIn: '7d' }
  );
};

// Register - สมัครสมาชิก
export const register = async (input: RegisterInput) => {
  // 1. เช็คว่า email ซ้ำไหม
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // 2. เข้ารหัส password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // 3. สร้าง user ใหม่
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      position: input.position,
      departmentId: input.departmentId,
      type: 'staff', // default เป็น staff
      status: 'active',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      type: true,
    },
  });

  // 4. สร้าง token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    type: user.type,
  });

  return { user, token };
};

// Login - เข้าสู่ระบบ
export const login = async (input: LoginInput) => {
  // 1. หา user จาก email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 2. เช็ค password
  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // 3. เช็คสถานะ user
  if (user.status !== 'active') {
    throw new Error('Account is inactive');
  }

  // 4. สร้าง token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    type: user.type,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
    },
    token,
  };
};