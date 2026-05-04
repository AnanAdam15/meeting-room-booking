import prisma from '../config/db';
import * as emailService from '../services/email.service';

// startReminderScheduler → เรียกจาก index.ts ตอน server start
//   setInterval (ทุก 5 นาที):
//     → prisma.booking.findMany({ status: 'approved', startDatetime: [55-60 นาทีข้างหน้า] })
//     → สำหรับแต่ละ booking ที่เจอ:
//       → emailService.sendMeetingReminder(user.email, title, room, startDatetime)
//         → Nodemailer ส่งอีเมลเตือน
export const startReminderScheduler = () => {
  console.log('⏰ เริ่ม Reminder Scheduler');

  setInterval(async () => {
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const fiveMinAgo = new Date(oneHourLater.getTime() - 5 * 60 * 1000);

      // หาการจองที่จะเริ่มในอีก ~1 ชั่วโมง (ช่วง 5 นาที)
      const upcomingBookings = await prisma.booking.findMany({
        where: {
          status: 'approved',
          startDatetime: {
            gte: fiveMinAgo,
            lte: oneHourLater,
          },
        },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          room: { select: { name: true } },
        },
      });

      for (const booking of upcomingBookings) {
        await emailService.sendMeetingReminder(
          booking.user.email,
          `${booking.user.firstName} ${booking.user.lastName}`,
          booking.title,
          booking.room.name,
          booking.startDatetime
        );
        console.log(`📧 ส่งเตือนการประชุม: ${booking.title} → ${booking.user.email}`);
      }
    } catch (error) {
      console.error('Reminder scheduler error:', error);
    }
  }, 5 * 60 * 1000); // ทุก 5 นาที
};