# 🏥 Meeting Room Booking System

> ระบบจองห้องประชุมออนไลน์สำหรับองค์กร — พัฒนาด้วย React, Node.js และ PostgreSQL

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-meeting--room--booking--murex.vercel.app-4f46e5?style=for-the-badge)](https://meeting-room-booking-murex.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-React_+_TypeScript-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_+_Prisma-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org)

</div>

---

## 📌 ภาพรวมโปรเจค

ระบบจองห้องประชุมแบบครบวงจร รองรับการจัดการห้องประชุมภายในองค์กร พร้อมระบบอนุมัติ แจ้งเตือนผ่านอีเมล และรายงานสถิติการใช้งาน

### ✨ Features หลัก

| Feature | รายละเอียด |
|---------|-----------|
| 📅 **จองห้องประชุม** | เลือกวันเวลา ตรวจสอบช่วงว่างแบบ real-time |
| ✅ **ระบบอนุมัติ** | workflow อนุมัติ/ปฏิเสธ พร้อมแสดงเหตุผล |
| 📧 **แจ้งเตือนอีเมล** | ส่ง email เมื่ออนุมัติ/ปฏิเสธ และเตือนก่อนประชุม 30 นาที |
| 🔔 **Notification** | แจ้งเตือน in-app แบบ real-time |
| 👥 **Role-based Access** | 3 roles: Admin, Approver, Member |
| 📊 **รายงานสถิติ** | สรุปการใช้ห้อง, ห้องที่นิยม, แนวโน้มรายเดือน |
| 🏢 **จัดการห้อง** | เพิ่ม/แก้ไข/ลบห้อง พร้อมจัดการอุปกรณ์ |
| 📝 **สมัครสมาชิกเอง** | User สมัครบัญชีได้เอง ไม่ต้องรอ Admin |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** — styling
- **React Router v6** — routing
- **Axios** — HTTP client
- **Vite** — build tool

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** — database access
- **PostgreSQL** — database (Neon)
- **JWT** — authentication
- **Nodemailer** — email notifications
- **bcryptjs** — password hashing

### DevOps
- **Vercel** — Frontend hosting
- **Render** — Backend hosting
- **Neon** — Serverless PostgreSQL

---

## 🗂️ โครงสร้างโปรเจค

```
meeting-room-booking/
├── frontend/                  # React + Vite
│   └── src/
│       ├── components/        # Reusable components
│       │   └── layout/        # Sidebar, Navbar, etc.
│       ├── contexts/          # AuthContext
│       ├── pages/             # Page components
│       │   ├── admin/         # Admin pages
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── RoomsPage.tsx
│       │   ├── CreateBookingPage.tsx
│       │   └── MyBookingsPage.tsx
│       ├── services/          # API service functions
│       └── types/             # TypeScript types
│
└── backend/                   # Node.js + Express
    ├── prisma/
    │   ├── schema.prisma      # Database schema
    │   └── seed.ts            # Initial data
    └── src/
        ├── controllers/       # Request handlers
        ├── services/          # Business logic
        ├── routes/            # API routes
        ├── middlewares/       # Auth, upload
        ├── utils/             # Scheduler, helpers
        └── index.ts           # Entry point
```

---

## 🗄️ Database Schema

```
Department ──< User >──< Booking >──< BookingEquipment >── Equipment
                  │          │
              MeetingRoom <──┘
                  │
              RoomEquipment >── Equipment
                  │
              Notification
```

**6 Models:** `Department`, `User`, `MeetingRoom`, `Booking`, `Equipment`, `Notification`

---

## 🔐 Roles & Permissions

| Role | สิทธิ์ |
|------|--------|
| **Admin** | จัดการ User, Room, Department, ดู Report ทั้งหมด |
| **Approver** | อนุมัติ/ปฏิเสธการจอง จัดการห้องที่รับผิดชอบ |
| **Member** | จองห้อง ดูประวัติการจองของตัวเอง |

---

## 🚀 รัน Local

### Prerequisites
- Node.js 18+
- PostgreSQL หรือ Neon account

### 1. Clone & Install

```bash
git clone https://github.com/AnanAdam15/meeting-room-booking.git
cd meeting-room-booking

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. ตั้งค่า Environment

สร้างไฟล์ `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/meeting_room_db"
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### 3. Setup Database

```bash
cd backend
npx prisma migrate dev
npx ts-node prisma/seed.ts
```

### 4. รัน Development Server

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## 🌐 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@hospital.com` | `password123` | Admin |
| `manager1@hospital.com` | `password123` | Approver |
| `doctor1@hospital.com` | `password123` | Member |
| `staff@hospital.com` | `password123` | Member |

---

## 📡 API Endpoints

```
POST   /api/auth/login           — เข้าสู่ระบบ
POST   /api/auth/register        — สมัครสมาชิก

GET    /api/rooms                 — รายการห้องทั้งหมด
POST   /api/rooms                 — สร้างห้องใหม่ (Admin)

GET    /api/bookings              — รายการจองทั้งหมด
POST   /api/bookings              — สร้างการจองใหม่
PATCH  /api/bookings/:id/approve  — อนุมัติการจอง (Approver)
PATCH  /api/bookings/:id/reject   — ปฏิเสธการจอง (Approver)

GET    /api/users                 — รายการ User (Admin)
GET    /api/departments           — รายการแผนก
GET    /api/reports/summary       — รายงานสรุป (Admin)
GET    /api/notifications         — การแจ้งเตือน
```

---

## ☁️ Deploy

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [meeting-room-booking-murex.vercel.app](https://meeting-room-booking-murex.vercel.app) |
| Backend | Render | `https://meeting-room-booking-api-zmuj.onrender.com` |
| Database | Neon | Serverless PostgreSQL |

---

## 👨‍💻 Developer

**Anan Adam** — Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-AnanAdam15-181717?style=flat-square&logo=github)](https://github.com/AnanAdam15)

---

<div align="center">
  <sub>Built with ❤️ as a portfolio project</sub>
</div>
