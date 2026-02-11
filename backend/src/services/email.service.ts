import { getTransporter } from '../config/mailer';
import nodemailer from 'nodemailer';

// ส่งอีเมลแจ้งเตือนเมื่อการจองถูกอนุมัติ
export const sendBookingApproved = async (
  toEmail: string,
  userName: string,
  bookingTitle: string,
  roomName: string,
  startDatetime: Date,
  endDatetime: Date
) => {
  const transporter = await getTransporter();

  const formatDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const info = await transporter.sendMail({
    from: '"ระบบจองห้องประชุม 🏥" <noreply@hospital.com>',
    to: toEmail,
    subject: `✅ การจองได้รับการอนุมัติ: ${bookingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">✅ การจองได้รับการอนุมัติ</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>สวัสดีคุณ <strong>${userName}</strong>,</p>
          <p>การจองของคุณได้รับการ <strong style="color: #10B981;">อนุมัติ</strong> แล้ว</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #6b7280;">หัวข้อ:</td><td style="padding: 8px; font-weight: bold;">${bookingTitle}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">ห้องประชุม:</td><td style="padding: 8px;">${roomName}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">วันที่:</td><td style="padding: 8px;">${formatDate(startDatetime)}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">เวลา:</td><td style="padding: 8px;">${formatTime(startDatetime)} - ${formatTime(endDatetime)}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">ระบบจองห้องประชุม โรงพยาบาล</p>
        </div>
      </div>
    `,
  });

  // แสดง URL สำหรับดูอีเมลทดสอบ (Ethereal)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 ดูอีเมลทดสอบ: ${previewUrl}`);
  }

  return info;
};

// ส่งอีเมลแจ้งเตือนเมื่อการจองถูกปฏิเสธ
export const sendBookingRejected = async (
  toEmail: string,
  userName: string,
  bookingTitle: string,
  roomName: string,
  startDatetime: Date,
  endDatetime: Date
) => {
  const transporter = await getTransporter();

  const formatDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const info = await transporter.sendMail({
    from: '"ระบบจองห้องประชุม 🏥" <noreply@hospital.com>',
    to: toEmail,
    subject: `❌ การจองถูกปฏิเสธ: ${bookingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #EF4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">❌ การจองถูกปฏิเสธ</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>สวัสดีคุณ <strong>${userName}</strong>,</p>
          <p>ขออภัย การจองของคุณ <strong style="color: #EF4444;">ถูกปฏิเสธ</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #6b7280;">หัวข้อ:</td><td style="padding: 8px; font-weight: bold;">${bookingTitle}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">ห้องประชุม:</td><td style="padding: 8px;">${roomName}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">วันที่:</td><td style="padding: 8px;">${formatDate(startDatetime)}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">เวลา:</td><td style="padding: 8px;">${formatTime(startDatetime)} - ${formatTime(endDatetime)}</td></tr>
          </table>
          <p>กรุณาติดต่อผู้ดูแลระบบหากต้องการข้อมูลเพิ่มเติม</p>
          <p style="color: #6b7280; font-size: 14px;">ระบบจองห้องประชุม โรงพยาบาล</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 ดูอีเมลทดสอบ: ${previewUrl}`);
  }

  return info;
};

// ส่งอีเมลแจ้งเตือน Admin เมื่อมีคำขอจองใหม่
export const sendNewBookingNotification = async (
  adminEmail: string,
  userName: string,
  bookingTitle: string,
  roomName: string,
  startDatetime: Date,
  endDatetime: Date
) => {
  const transporter = await getTransporter();

  const formatDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const info = await transporter.sendMail({
    from: '"ระบบจองห้องประชุม 🏥" <noreply@hospital.com>',
    to: adminEmail,
    subject: `📋 คำขอจองใหม่: ${bookingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">📋 มีคำขอจองห้องประชุมใหม่</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>มีคำขอจองใหม่จาก <strong>${userName}</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #6b7280;">หัวข้อ:</td><td style="padding: 8px; font-weight: bold;">${bookingTitle}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">ห้องประชุม:</td><td style="padding: 8px;">${roomName}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">วันที่:</td><td style="padding: 8px;">${formatDate(startDatetime)}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">เวลา:</td><td style="padding: 8px;">${formatTime(startDatetime)} - ${formatTime(endDatetime)}</td></tr>
          </table>
          <p>กรุณาเข้าสู่ระบบเพื่ออนุมัติหรือปฏิเสธคำขอ</p>
          <p style="color: #6b7280; font-size: 14px;">ระบบจองห้องประชุม โรงพยาบาล</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 ดูอีเมลทดสอบ: ${previewUrl}`);
  }

  return info;
};

// ส่งอีเมลเตือนก่อนประชุม 1 ชั่วโมง
export const sendMeetingReminder = async (
  toEmail: string,
  userName: string,
  bookingTitle: string,
  roomName: string,
  startDatetime: Date
) => {
  const transporter = await getTransporter();

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const info = await transporter.sendMail({
    from: '"ระบบจองห้องประชุม 🏥" <noreply@hospital.com>',
    to: toEmail,
    subject: `⏰ เตือน: การประชุมในอีก 1 ชั่วโมง - ${bookingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #F59E0B; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⏰ เตือนการประชุม</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>สวัสดีคุณ <strong>${userName}</strong>,</p>
          <p>คุณมีการประชุมในอีก <strong style="color: #F59E0B;">1 ชั่วโมง</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #6b7280;">หัวข้อ:</td><td style="padding: 8px; font-weight: bold;">${bookingTitle}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">ห้องประชุม:</td><td style="padding: 8px;">${roomName}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">เวลา:</td><td style="padding: 8px;">${formatTime(startDatetime)}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">ระบบจองห้องประชุม โรงพยาบาล</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 ดูอีเมลทดสอบ: ${previewUrl}`);
  }

  return info;
};