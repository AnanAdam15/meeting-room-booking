import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

const createTransporter = async () => {
  // ถ้ามี SMTP config ใน .env → ส่งอีเมลจริง
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('📧 ใช้ SMTP จริง:', process.env.SMTP_HOST);
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
    // ถ้าไม่มี → ใช้ Ethereal (ทดสอบ)
    console.log('📧 ใช้ Ethereal Email (ทดสอบ)');
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
  }

  return transporter;
};

export const getTransporter = async () => {
  if (!transporter) {
    await createTransporter();
  }
  return transporter;
};