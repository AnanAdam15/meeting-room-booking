import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import bookingRoutes from './routes/booking.routes';
import { startReminderScheduler } from './utils/scheduler';
import reportRoutes from './routes/report.routes';
import equipmentRoutes from './routes/equipment.routes';
import departmentRoutes from './routes/department.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';



// โหลดค่าจากไฟล์ .env
dotenv.config();

// สร้าง Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// เสิร์ฟไฟล์รูปจากโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Route ทดสอบ
app.get('/', (req, res) => {
  res.json({ message: 'Hello! Meeting Room Booking API is running 🚀' });
});

// กำหนด Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  // เริ่ม scheduler เตือนก่อนประชุม
  startReminderScheduler();
});