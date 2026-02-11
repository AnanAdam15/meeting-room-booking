import nodemailer from 'nodemailer';

// สร้าง transporter (ใช้ Ethereal สำหรับทดสอบ ไม่ส่งอีเมลจริง)
let transporter: nodemailer.Transporter;

export const getTransporter = async () => {
  if (transporter) return transporter;

  // ถ้ามี config จริงใน .env ให้ใช้
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // ใช้ Ethereal สำหรับทดสอบ (จำลองการส่งอีเมล)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 ใช้ Ethereal Email สำหรับทดสอบ');
    console.log(`   User: ${testAccount.user}`);
  }

  return transporter;
};