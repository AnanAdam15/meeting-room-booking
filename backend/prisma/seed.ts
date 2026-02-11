/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===== 1. สร้าง Departments =====
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: 'dept-medical' },
      update: {},
      create: {
        id: 'dept-medical',
        name: 'แผนกแพทย์',
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-nursing' },
      update: {},
      create: {
        id: 'dept-nursing',
        name: 'แผนกพยาบาล',
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-hr' },
      update: {},
      create: {
        id: 'dept-hr',
        name: 'แผนกทรัพยากรบุคคล',
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-it' },
      update: {},
      create: {
        id: 'dept-it',
        name: 'แผนกเทคโนโลยีสารสนเทศ',
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-finance' },
      update: {},
      create: {
        id: 'dept-finance',
        name: 'แผนกการเงิน',
      },
    }),
  ]);

  console.log(`✅ Created ${departments.length} departments`);

  // ===== 2. สร้าง Users (2 roles: admin, staff) =====
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {},
      create: {
        email: 'admin@hospital.com',
        password: hashedPassword,
        firstName: 'ผู้ดูแล',
        lastName: 'ระบบ',
        phone: '081-111-1111',
        position: 'System Administrator',
        type: 'admin',
        status: 'active',
        departmentId: 'dept-it',
      },
    }),
    // Staff 1
    prisma.user.upsert({
      where: { email: 'staff@hospital.com' },
      update: {},
      create: {
        email: 'staff@hospital.com',
        password: hashedPassword,
        firstName: 'สมชาย',
        lastName: 'พนักงาน',
        phone: '081-222-2222',
        position: 'พนักงานทั่วไป',
        type: 'staff',
        status: 'active',
        departmentId: 'dept-hr',
      },
    }),
    // Staff 2 - พยาบาล
    prisma.user.upsert({
      where: { email: 'nurse@hospital.com' },
      update: {},
      create: {
        email: 'nurse@hospital.com',
        password: hashedPassword,
        firstName: 'สมหญิง',
        lastName: 'พยาบาล',
        phone: '081-333-3333',
        position: 'พยาบาล',
        type: 'staff',
        status: 'active',
        departmentId: 'dept-nursing',
      },
    }),
    // Staff 3 - แพทย์
    prisma.user.upsert({
      where: { email: 'doctor@hospital.com' },
      update: {},
      create: {
        email: 'doctor@hospital.com',
        password: hashedPassword,
        firstName: 'นพ.วิชัย',
        lastName: 'รักษา',
        phone: '081-444-4444',
        position: 'แพทย์',
        type: 'staff',
        status: 'active',
        departmentId: 'dept-medical',
      },
    }),
    // Staff 4 - IT
    prisma.user.upsert({
      where: { email: 'it@hospital.com' },
      update: {},
      create: {
        email: 'it@hospital.com',
        password: hashedPassword,
        firstName: 'สมศักดิ์',
        lastName: 'ไอที',
        phone: '081-555-5555',
        position: 'IT Support',
        type: 'staff',
        status: 'active',
        departmentId: 'dept-it',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ===== 3. สร้าง Meeting Rooms =====
  const rooms = await Promise.all([
    prisma.meetingRoom.upsert({
      where: { id: 'room-1' },
      update: {},
      create: {
        id: 'room-1',
        name: 'ห้องประชุม A',
        location: 'อาคาร 1 ชั้น 2',
        capacity: 10,
        description: 'ห้องประชุมขนาดเล็ก เหมาะสำหรับประชุมทีม',
        status: 'available',
      },
    }),
    prisma.meetingRoom.upsert({
      where: { id: 'room-2' },
      update: {},
      create: {
        id: 'room-2',
        name: 'ห้องประชุม B',
        location: 'อาคาร 1 ชั้น 3',
        capacity: 20,
        description: 'ห้องประชุมขนาดกลาง มีจอ Projector',
        status: 'available',
      },
    }),
    prisma.meetingRoom.upsert({
      where: { id: 'room-3' },
      update: {},
      create: {
        id: 'room-3',
        name: 'ห้องประชุมใหญ่',
        location: 'อาคาร 2 ชั้น 5',
        capacity: 50,
        description: 'ห้องประชุมขนาดใหญ่ สำหรับประชุมทั้งโรงพยาบาล',
        status: 'available',
      },
    }),
    prisma.meetingRoom.upsert({
      where: { id: 'room-4' },
      update: {},
      create: {
        id: 'room-4',
        name: 'ห้องประชุมผู้บริหาร',
        location: 'อาคาร 1 ชั้น 10',
        capacity: 8,
        description: 'ห้องประชุม VIP สำหรับผู้บริหาร',
        status: 'available',
      },
    }),
  ]);

  console.log(`✅ Created ${rooms.length} meeting rooms`);

  // ===== 4. สร้าง Equipment =====
  const equipments = await Promise.all([
    prisma.equipment.upsert({
      where: { id: 'equip-1' },
      update: {},
      create: {
        id: 'equip-1',
        name: 'Projector',
      },
    }),
    prisma.equipment.upsert({
      where: { id: 'equip-2' },
      update: {},
      create: {
        id: 'equip-2',
        name: 'Whiteboard',
      },
    }),
    prisma.equipment.upsert({
      where: { id: 'equip-3' },
      update: {},
      create: {
        id: 'equip-3',
        name: 'Video Conference',
      },
    }),
    prisma.equipment.upsert({
      where: { id: 'equip-4' },
      update: {},
      create: {
        id: 'equip-4',
        name: 'TV Screen',
      },
    }),
  ]);

  console.log(`✅ Created ${equipments.length} equipments`);

  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('┌─────────────────────────┬─────────────────┬───────────────┐');
  console.log('│ Email                   │ Password        │ Role          │');
  console.log('├─────────────────────────┼─────────────────┼───────────────┤');
  console.log('│ admin@hospital.com      │ password123     │ admin         │');
  console.log('│ staff@hospital.com      │ password123     │ staff         │');
  console.log('│ nurse@hospital.com      │ password123     │ staff         │');
  console.log('│ doctor@hospital.com     │ password123     │ staff         │');
  console.log('│ it@hospital.com         │ password123     │ staff         │');
  console.log('└─────────────────────────┴─────────────────┴───────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });