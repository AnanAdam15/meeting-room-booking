/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing existing data...');

  // ลบตามลำดับ FK (ลูกก่อน แม่หลัง)
  await prisma.notification.deleteMany();
  await prisma.bookingEquipment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomEquipment.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.meetingRoom.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('✅ Cleared all data');
  console.log('');
  console.log('🌱 Starting seed...');

  // ===== 1. สร้าง Departments =====
  const deptData = [
    { id: 'dept-admin',    name: 'ฝ่ายบริหาร' },
    { id: 'dept-medical',  name: 'แผนกอายุรกรรม' },
    { id: 'dept-surgery',  name: 'แผนกศัลยกรรม' },
    { id: 'dept-nursing',  name: 'แผนกการพยาบาล' },
    { id: 'dept-pharma',   name: 'แผนกเภสัชกรรม' },
    { id: 'dept-lab',      name: 'แผนกพยาธิวิทยา' },
    { id: 'dept-radiology',name: 'แผนกรังสีวิทยา' },
    { id: 'dept-hr',       name: 'แผนกทรัพยากรบุคคล' },
    { id: 'dept-it',       name: 'แผนกเทคโนโลยีสารสนเทศ' },
    { id: 'dept-finance',  name: 'แผนกการเงินและบัญชี' },
    { id: 'dept-edu',      name: 'แผนกฝึกอบรมและการศึกษา' },
  ];

  await prisma.department.createMany({ data: deptData });
  console.log(`✅ Created ${deptData.length} departments`);

  // ===== 2. สร้าง Equipment =====
  const equipData = [
    { id: 'eq-projector',   name: 'Projector' },
    { id: 'eq-screen',      name: 'จอ LED/TV ขนาดใหญ่' },
    { id: 'eq-whiteboard',  name: 'Whiteboard' },
    { id: 'eq-vidconf',     name: 'ระบบ Video Conference' },
    { id: 'eq-mic',         name: 'ไมโครโฟน (ไร้สาย)' },
    { id: 'eq-speaker',     name: 'ลำโพงระบบเสียง' },
    { id: 'eq-laptop',      name: 'Laptop สำรอง' },
    { id: 'eq-flipchart',   name: 'Flipchart' },
    { id: 'eq-webcam',      name: 'Webcam HD' },
    { id: 'eq-pointer',     name: 'Laser Pointer' },
  ];

  await prisma.equipment.createMany({ data: equipData });
  console.log(`✅ Created ${equipData.length} equipment types`);

  // ===== 3. สร้าง Users =====
  const hashedPassword = await bcrypt.hash('password123', 10);

  const userData = [
    // Admin
    {
      email: 'admin@hospital.com', password: hashedPassword,
      firstName: 'สุรศักดิ์', lastName: 'ผู้ดูแลระบบ',
      phone: '081-100-0001', position: 'System Administrator',
      type: 'admin', status: 'active', departmentId: 'dept-it',
    },
    // Room Managers
    {
      email: 'manager1@hospital.com', password: hashedPassword,
      firstName: 'วิภาวดี', lastName: 'จัดการห้อง',
      phone: '081-100-0002', position: 'Room Manager',
      type: 'approver', status: 'active', departmentId: 'dept-admin',
    },
    {
      email: 'manager2@hospital.com', password: hashedPassword,
      firstName: 'ประวิทย์', lastName: 'ดูแลสถานที่',
      phone: '081-100-0003', position: 'Facility Manager',
      type: 'approver', status: 'active', departmentId: 'dept-admin',
    },
    // Staff - แพทย์
    {
      email: 'doctor1@hospital.com', password: hashedPassword,
      firstName: 'นพ.วิชัย', lastName: 'รักษาดี',
      phone: '081-200-0001', position: 'แพทย์อายุรกรรม',
      type: 'staff', status: 'active', departmentId: 'dept-medical',
    },
    {
      email: 'doctor2@hospital.com', password: hashedPassword,
      firstName: 'พญ.สุภาพร', lastName: 'ใจดี',
      phone: '081-200-0002', position: 'แพทย์ศัลยกรรม',
      type: 'staff', status: 'active', departmentId: 'dept-surgery',
    },
    // Staff - พยาบาล
    {
      email: 'nurse1@hospital.com', password: hashedPassword,
      firstName: 'สมหญิง', lastName: 'พยาบาลดี',
      phone: '081-300-0001', position: 'พยาบาลวิชาชีพ',
      type: 'staff', status: 'active', departmentId: 'dept-nursing',
    },
    {
      email: 'nurse2@hospital.com', password: hashedPassword,
      firstName: 'มาลี', lastName: 'ขยันดี',
      phone: '081-300-0002', position: 'หัวหน้าพยาบาล',
      type: 'staff', status: 'active', departmentId: 'dept-nursing',
    },
    // Staff - เภสัช
    {
      email: 'pharma@hospital.com', password: hashedPassword,
      firstName: 'ภก.สมศักดิ์', lastName: 'ยาดี',
      phone: '081-400-0001', position: 'เภสัชกร',
      type: 'staff', status: 'active', departmentId: 'dept-pharma',
    },
    // Staff - IT
    {
      email: 'it@hospital.com', password: hashedPassword,
      firstName: 'ธีรวัฒน์', lastName: 'ไอที',
      phone: '081-500-0001', position: 'IT Support',
      type: 'staff', status: 'active', departmentId: 'dept-it',
    },
    // Staff - HR
    {
      email: 'hr@hospital.com', password: hashedPassword,
      firstName: 'กานดา', lastName: 'บุคคล',
      phone: '081-600-0001', position: 'เจ้าหน้าที่ HR',
      type: 'staff', status: 'active', departmentId: 'dept-hr',
    },
    // Staff - การเงิน
    {
      email: 'finance@hospital.com', password: hashedPassword,
      firstName: 'นิภา', lastName: 'การเงิน',
      phone: '081-700-0001', position: 'นักบัญชี',
      type: 'staff', status: 'active', departmentId: 'dept-finance',
    },
    // Staff - การศึกษา
    {
      email: 'trainer@hospital.com', password: hashedPassword,
      firstName: 'อาจารย์วัลลภ', lastName: 'สอนดี',
      phone: '081-800-0001', position: 'นักวิชาการ',
      type: 'staff', status: 'active', departmentId: 'dept-edu',
    },
    // Staff - ทั่วไป
    {
      email: 'staff@hospital.com', password: hashedPassword,
      firstName: 'สมชาย', lastName: 'พนักงาน',
      phone: '081-900-0001', position: 'เจ้าหน้าที่ทั่วไป',
      type: 'staff', status: 'active', departmentId: 'dept-admin',
    },
  ];

  await prisma.user.createMany({ data: userData });
  console.log(`✅ Created ${userData.length} users`);

  // ===== 4. สร้าง Meeting Rooms (25 ห้อง) =====
  const roomData = [
    // --- อาคาร A (ฝ่ายบริหาร) ---
    {
      id: 'room-a101',
      name: 'ห้องประชุม A101',
      location: 'อาคาร A ชั้น 1',
      capacity: 10,
      description: 'ห้องประชุมขนาดเล็ก เหมาะสำหรับประชุมทีม 5-10 คน มี Whiteboard และ TV Screen',
      status: 'available',
      image: 'room-a101.jpg.png',
    },
    {
      id: 'room-a102',
      name: 'ห้องประชุม A102',
      location: 'อาคาร A ชั้น 1',
      capacity: 8,
      description: 'ห้องประชุมขนาดเล็ก สำหรับประชุมย่อย หรือสัมภาษณ์งาน',
      status: 'available',
      image: 'room-a102.jpg.png',
    },
    {
      id: 'room-a201',
      name: 'ห้องประชุม A201',
      location: 'อาคาร A ชั้น 2',
      capacity: 20,
      description: 'ห้องประชุมขนาดกลาง พร้อม Projector และระบบเสียง',
      status: 'available',
      image: 'room-a201.jpg.png',
    },
    {
      id: 'room-a202',
      name: 'ห้องประชุม A202',
      location: 'อาคาร A ชั้น 2',
      capacity: 15,
      description: 'ห้องประชุมขนาดกลาง มีระบบ Video Conference สำหรับประชุมออนไลน์',
      status: 'available',
      image: 'room-a202.jpg.png',
    },
    {
      id: 'room-a-vip',
      name: 'ห้องประชุมผู้บริหาร',
      location: 'อาคาร A ชั้น 5',
      capacity: 12,
      description: 'ห้องประชุม VIP สำหรับผู้บริหาร ตกแต่งพิเศษ มีครบทุกสิ่งอำนวยความสะดวก',
      status: 'available',
      image: 'room-a-vip.jpg.png',
    },

    // --- อาคาร B (อาคารผู้ป่วย / แพทย์) ---
    {
      id: 'room-b101',
      name: 'ห้องประชุมแพทย์ 1',
      location: 'อาคาร B ชั้น 1',
      capacity: 12,
      description: 'ห้องประชุมสำหรับแพทย์และทีมรักษา ทบทวนเคส Morning Round',
      status: 'available',
      image: 'room-b101.jpg.png',
    },
    {
      id: 'room-b102',
      name: 'ห้องประชุมแพทย์ 2',
      location: 'อาคาร B ชั้น 1',
      capacity: 12,
      description: 'ห้องประชุมสำหรับแพทย์และทีมรักษา สำหรับแผนกศัลยกรรม',
      status: 'available',
      image: 'room-b102.jpg.png',
    },
    {
      id: 'room-b201',
      name: 'ห้องประชุมพยาบาล',
      location: 'อาคาร B ชั้น 2',
      capacity: 25,
      description: 'ห้องประชุมสำหรับทีมพยาบาล Morning/Evening Brief',
      status: 'available',
      image: 'room-b201.jpg.png',
    },
    {
      id: 'room-b301',
      name: 'ห้องอบรมพยาบาล',
      location: 'อาคาร B ชั้น 3',
      capacity: 40,
      description: 'ห้องอบรมและฝึกทักษะพยาบาล มีอุปกรณ์ฝึกซ้อม Projector และไมโครโฟน',
      status: 'available',
      image: 'room-b301.jpg.png',
    },
    {
      id: 'room-b401',
      name: 'ห้องประชุม ICU',
      location: 'อาคาร B ชั้น 4',
      capacity: 8,
      description: 'ห้องประชุมใกล้ ICU สำหรับประชุมด่วน ทบทวนผู้ป่วยวิกฤต',
      status: 'available',
      image: 'room-b401.jpg.png',
    },

    // --- อาคาร C (ศูนย์การประชุมและอบรม) ---
    {
      id: 'room-c-grand',
      name: 'Grand Conference Hall',
      location: 'อาคาร C ชั้น 1',
      capacity: 200,
      description: 'ห้องประชุมใหญ่ที่สุด สำหรับงานสัมมนา ประชุมทั้งโรงพยาบาล มีเวที ระบบเสียงครบ',
      status: 'available',
      image: 'room-c-grand.jpg.png',
    },
    {
      id: 'room-c201',
      name: 'ห้องสัมมนา C201',
      location: 'อาคาร C ชั้น 2',
      capacity: 60,
      description: 'ห้องสัมมนาขนาดใหญ่ พร้อม Projector คู่ ระบบไมค์ไร้สาย',
      status: 'available',
      image: 'room-c201.jpg.png',
    },
    {
      id: 'room-c202',
      name: 'ห้องสัมมนา C202',
      location: 'อาคาร C ชั้น 2',
      capacity: 50,
      description: 'ห้องสัมมนาขนาดกลาง สำหรับจัดอบรมภายนอก/ภายใน',
      status: 'available',
      image: 'room-c202.jpg.png',
    },
    {
      id: 'room-c301',
      name: 'ห้องอบรม C301',
      location: 'อาคาร C ชั้น 3',
      capacity: 30,
      description: 'ห้องอบรมพร้อม Flipchart และ Projector เหมาะสำหรับ Workshop',
      status: 'available',
      image: 'room-c301.jpg.png',
    },
    {
      id: 'room-c302',
      name: 'ห้องอบรม C302',
      location: 'อาคาร C ชั้น 3',
      capacity: 30,
      description: 'ห้องอบรมขนาดกลาง จัด Layout แบบ Classroom ได้',
      status: 'available',
      image: 'room-c302.jpg.png',
    },
    {
      id: 'room-c-vidconf',
      name: 'ห้อง Video Conference',
      location: 'อาคาร C ชั้น 4',
      capacity: 15,
      description: 'ห้องประชุมทางไกล ระบบ Video Conference คุณภาพสูง สำหรับประชุมกับหน่วยงานภายนอก',
      status: 'available',
      image: 'room-c-vidconf.jpg.png',
    },

    // --- อาคาร D (ฝ่ายสนับสนุน) ---
    {
      id: 'room-d-it',
      name: 'ห้องประชุม IT',
      location: 'อาคาร D ชั้น 2',
      capacity: 10,
      description: 'ห้องประชุมแผนก IT สำหรับ Sprint Planning, Stand-up, Code Review',
      status: 'available',
      image: 'room-d-it.jpg.png',
    },
    {
      id: 'room-d-hr',
      name: 'ห้องประชุม HR',
      location: 'อาคาร D ชั้น 3',
      capacity: 12,
      description: 'ห้องประชุมแผนก HR สำหรับสัมภาษณ์งาน ประชุมบุคลากร',
      status: 'available',
      image: 'room-d-hr.jpg.png',
    },
    {
      id: 'room-d-finance',
      name: 'ห้องประชุมการเงิน',
      location: 'อาคาร D ชั้น 4',
      capacity: 10,
      description: 'ห้องประชุมแผนกการเงินและบัญชี สำหรับนำเสนองบประมาณ',
      status: 'available',
      image: 'room-d-finance.jpg.png',
    },
    {
      id: 'room-d501',
      name: 'ห้องประชุม D501',
      location: 'อาคาร D ชั้น 5',
      capacity: 20,
      description: 'ห้องประชุมอเนกประสงค์ สำหรับประชุมข้ามแผนก',
      status: 'available',
      image: 'room-d501.jpg.png',
    },

    // --- อาคารการศึกษา ---
    {
      id: 'room-edu-101',
      name: 'ห้องเรียนแพทย์ 101',
      location: 'อาคารการศึกษา ชั้น 1',
      capacity: 40,
      description: 'ห้องเรียนสำหรับนักศึกษาแพทย์และแพทย์ฝึกหัด มี Projector และ Whiteboard ขนาดใหญ่',
      status: 'available',
      image: 'room-edu-101.jpg.png',
    },
    {
      id: 'room-edu-102',
      name: 'ห้องเรียนแพทย์ 102',
      location: 'อาคารการศึกษา ชั้น 1',
      capacity: 40,
      description: 'ห้องเรียนขนาดใหญ่ สำหรับการบรรยายและ Case Discussion',
      status: 'available',
      image: 'room-edu-102.jpg.png',
    },
    {
      id: 'room-sim',
      name: 'ห้อง Simulation Center',
      location: 'อาคารการศึกษา ชั้น 2',
      capacity: 20,
      description: 'ห้องฝึกซ้อมทักษะทางการแพทย์ มีระบบ Video สำหรับ Debrief',
      status: 'available',
      image: 'room-sim.jpg.png',
    },

    // --- อาคารบริหาร ---
    {
      id: 'room-board',
      name: 'ห้องประชุมคณะกรรมการ',
      location: 'อาคารบริหาร ชั้น 7',
      capacity: 20,
      description: 'ห้องประชุมคณะกรรมการบริหาร ตกแต่งพิเศษ ใช้สำหรับประชุมระดับสูง',
      status: 'available',
      image: 'room-board.jpg.png',
    },
    {
      id: 'room-press',
      name: 'ห้องแถลงข่าว',
      location: 'อาคารบริหาร ชั้น 1',
      capacity: 50,
      description: 'ห้องสำหรับแถลงข่าวและกิจกรรมสาธารณะ มีระบบเสียงและแสงครบครัน',
      status: 'available',
      image: 'room-press.jpg.png',
    },
    {
      id: 'room-maint',
      name: 'ห้องประชุมช่างซ่อมบำรุง',
      location: 'อาคาร E ชั้น 1',
      capacity: 15,
      description: 'ห้องประชุมแผนกวิศวกรรมและซ่อมบำรุง',
      status: 'maintenance',
      image: 'room-maint.jpg.png',
    },
  ];

  await prisma.meetingRoom.createMany({ data: roomData });
  console.log(`✅ Created ${roomData.length} meeting rooms`);

  // ===== 5. กำหนด Equipment ให้ห้อง =====
  const roomEquipData = [
    // ห้องประชุม A101
    { roomId: 'room-a101', equipmentId: 'eq-screen',     quantity: 1 },
    { roomId: 'room-a101', equipmentId: 'eq-whiteboard', quantity: 1 },
    // ห้องประชุม A102
    { roomId: 'room-a102', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-a102', equipmentId: 'eq-flipchart',  quantity: 1 },
    // ห้องประชุม A201
    { roomId: 'room-a201', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-a201', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-a201', equipmentId: 'eq-mic',        quantity: 2 },
    { roomId: 'room-a201', equipmentId: 'eq-speaker',    quantity: 1 },
    // ห้องประชุม A202 (Video Conference)
    { roomId: 'room-a202', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-a202', equipmentId: 'eq-vidconf',    quantity: 1 },
    { roomId: 'room-a202', equipmentId: 'eq-webcam',     quantity: 1 },
    { roomId: 'room-a202', equipmentId: 'eq-mic',        quantity: 4 },
    // ห้องผู้บริหาร
    { roomId: 'room-a-vip', equipmentId: 'eq-screen',    quantity: 2 },
    { roomId: 'room-a-vip', equipmentId: 'eq-vidconf',   quantity: 1 },
    { roomId: 'room-a-vip', equipmentId: 'eq-mic',       quantity: 6 },
    { roomId: 'room-a-vip', equipmentId: 'eq-speaker',   quantity: 2 },
    { roomId: 'room-a-vip', equipmentId: 'eq-laptop',    quantity: 1 },
    // ห้องประชุมแพทย์ 1
    { roomId: 'room-b101', equipmentId: 'eq-screen',     quantity: 1 },
    { roomId: 'room-b101', equipmentId: 'eq-whiteboard', quantity: 1 },
    // ห้องประชุมแพทย์ 2
    { roomId: 'room-b102', equipmentId: 'eq-screen',     quantity: 1 },
    { roomId: 'room-b102', equipmentId: 'eq-whiteboard', quantity: 1 },
    // ห้องประชุมพยาบาล
    { roomId: 'room-b201', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-b201', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-b201', equipmentId: 'eq-mic',        quantity: 2 },
    // ห้องอบรมพยาบาล
    { roomId: 'room-b301', equipmentId: 'eq-projector',  quantity: 2 },
    { roomId: 'room-b301', equipmentId: 'eq-whiteboard', quantity: 2 },
    { roomId: 'room-b301', equipmentId: 'eq-mic',        quantity: 4 },
    { roomId: 'room-b301', equipmentId: 'eq-speaker',    quantity: 2 },
    { roomId: 'room-b301', equipmentId: 'eq-flipchart',  quantity: 2 },
    // ห้อง ICU
    { roomId: 'room-b401', equipmentId: 'eq-screen',     quantity: 1 },
    { roomId: 'room-b401', equipmentId: 'eq-whiteboard', quantity: 1 },
    // Grand Conference Hall
    { roomId: 'room-c-grand', equipmentId: 'eq-projector', quantity: 2 },
    { roomId: 'room-c-grand', equipmentId: 'eq-screen',    quantity: 2 },
    { roomId: 'room-c-grand', equipmentId: 'eq-mic',       quantity: 10 },
    { roomId: 'room-c-grand', equipmentId: 'eq-speaker',   quantity: 4 },
    { roomId: 'room-c-grand', equipmentId: 'eq-laptop',    quantity: 2 },
    { roomId: 'room-c-grand', equipmentId: 'eq-pointer',   quantity: 2 },
    // ห้องสัมมนา C201
    { roomId: 'room-c201', equipmentId: 'eq-projector',  quantity: 2 },
    { roomId: 'room-c201', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-c201', equipmentId: 'eq-mic',        quantity: 6 },
    { roomId: 'room-c201', equipmentId: 'eq-speaker',    quantity: 2 },
    { roomId: 'room-c201', equipmentId: 'eq-pointer',    quantity: 1 },
    // ห้องสัมมนา C202
    { roomId: 'room-c202', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-c202', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-c202', equipmentId: 'eq-mic',        quantity: 4 },
    { roomId: 'room-c202', equipmentId: 'eq-speaker',    quantity: 2 },
    // ห้องอบรม C301
    { roomId: 'room-c301', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-c301', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-c301', equipmentId: 'eq-flipchart',  quantity: 3 },
    { roomId: 'room-c301', equipmentId: 'eq-mic',        quantity: 2 },
    // ห้องอบรม C302
    { roomId: 'room-c302', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-c302', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-c302', equipmentId: 'eq-flipchart',  quantity: 2 },
    // ห้อง Video Conference
    { roomId: 'room-c-vidconf', equipmentId: 'eq-vidconf',  quantity: 1 },
    { roomId: 'room-c-vidconf', equipmentId: 'eq-screen',   quantity: 2 },
    { roomId: 'room-c-vidconf', equipmentId: 'eq-webcam',   quantity: 2 },
    { roomId: 'room-c-vidconf', equipmentId: 'eq-mic',      quantity: 6 },
    { roomId: 'room-c-vidconf', equipmentId: 'eq-speaker',  quantity: 2 },
    // ห้อง IT
    { roomId: 'room-d-it', equipmentId: 'eq-screen',     quantity: 1 },
    { roomId: 'room-d-it', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-d-it', equipmentId: 'eq-laptop',     quantity: 1 },
    // ห้อง HR
    { roomId: 'room-d-hr', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-d-hr', equipmentId: 'eq-flipchart',  quantity: 1 },
    // ห้องการเงิน
    { roomId: 'room-d-finance', equipmentId: 'eq-projector', quantity: 1 },
    { roomId: 'room-d-finance', equipmentId: 'eq-whiteboard',quantity: 1 },
    // ห้อง D501
    { roomId: 'room-d501', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-d501', equipmentId: 'eq-whiteboard', quantity: 1 },
    { roomId: 'room-d501', equipmentId: 'eq-mic',        quantity: 2 },
    // ห้องเรียนแพทย์ 101
    { roomId: 'room-edu-101', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-edu-101', equipmentId: 'eq-whiteboard', quantity: 2 },
    { roomId: 'room-edu-101', equipmentId: 'eq-mic',        quantity: 2 },
    { roomId: 'room-edu-101', equipmentId: 'eq-pointer',    quantity: 1 },
    // ห้องเรียนแพทย์ 102
    { roomId: 'room-edu-102', equipmentId: 'eq-projector',  quantity: 1 },
    { roomId: 'room-edu-102', equipmentId: 'eq-whiteboard', quantity: 2 },
    { roomId: 'room-edu-102', equipmentId: 'eq-mic',        quantity: 2 },
    // Simulation Center
    { roomId: 'room-sim', equipmentId: 'eq-screen',     quantity: 2 },
    { roomId: 'room-sim', equipmentId: 'eq-vidconf',    quantity: 1 },
    { roomId: 'room-sim', equipmentId: 'eq-webcam',     quantity: 2 },
    { roomId: 'room-sim', equipmentId: 'eq-mic',        quantity: 4 },
    // ห้องคณะกรรมการ
    { roomId: 'room-board', equipmentId: 'eq-screen',    quantity: 2 },
    { roomId: 'room-board', equipmentId: 'eq-vidconf',   quantity: 1 },
    { roomId: 'room-board', equipmentId: 'eq-mic',       quantity: 6 },
    { roomId: 'room-board', equipmentId: 'eq-laptop',    quantity: 1 },
    // ห้องแถลงข่าว
    { roomId: 'room-press', equipmentId: 'eq-projector', quantity: 1 },
    { roomId: 'room-press', equipmentId: 'eq-screen',    quantity: 2 },
    { roomId: 'room-press', equipmentId: 'eq-mic',       quantity: 8 },
    { roomId: 'room-press', equipmentId: 'eq-speaker',   quantity: 4 },
    { roomId: 'room-press', equipmentId: 'eq-pointer',   quantity: 1 },
    // ห้องซ่อมบำรุง (maintenance - ไม่มีอุปกรณ์พิเศษ)
    { roomId: 'room-maint', equipmentId: 'eq-whiteboard', quantity: 1 },
  ];

  await prisma.roomEquipment.createMany({ data: roomEquipData });
  console.log(`✅ Assigned equipment to rooms`);

  // ===== สรุปผล =====
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Departments : ${deptData.length}`);
  console.log(`   Users       : ${userData.length}`);
  console.log(`   Rooms       : ${roomData.length}`);
  console.log(`   Equipments  : ${equipData.length}`);
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('┌───────────────────────────┬─────────────────┬────────────────┐');
  console.log('│ Email                     │ Password        │ Role           │');
  console.log('├───────────────────────────┼─────────────────┼────────────────┤');
  console.log('│ admin@hospital.com        │ password123     │ admin          │');
  console.log('│ manager1@hospital.com     │ password123     │ approver   │');
  console.log('│ manager2@hospital.com     │ password123     │ approver   │');
  console.log('│ doctor1@hospital.com      │ password123     │ staff          │');
  console.log('│ nurse1@hospital.com       │ password123     │ staff          │');
  console.log('│ staff@hospital.com        │ password123     │ staff          │');
  console.log('│ (และอื่นๆ อีก 7 คน)      │ password123     │ staff          │');
  console.log('└───────────────────────────┴─────────────────┴────────────────┘');
  console.log('');
  console.log('🏥 Rooms by building:');
  console.log('   อาคาร A (ฝ่ายบริหาร)     : 5 ห้อง (8-20 คน)');
  console.log('   อาคาร B (อาคารผู้ป่วย)   : 5 ห้อง (8-40 คน)');
  console.log('   อาคาร C (ศูนย์ประชุม)    : 6 ห้อง (15-200 คน)');
  console.log('   อาคาร D (ฝ่ายสนับสนุน)   : 4 ห้อง (10-20 คน)');
  console.log('   อาคารการศึกษา            : 3 ห้อง (20-40 คน)');
  console.log('   อาคารบริหาร              : 2 ห้อง (20-50 คน)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
