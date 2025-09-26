import nodemailer from 'nodemailer';

let transporter = null;

function canSend() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.FROM_EMAIL
  );
}

function getTransporter() {
  if (!canSend()) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendOtpEmail(toEmail, code) {
  const subject = 'Your Bear verification code';
  const text = `Your 6-digit verification code is: ${code}. It expires in 10 minutes.`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5"><h2>Bear</h2><p>Your 6-digit verification code is:</p><div style="font-size:24px;font-weight:bold; letter-spacing:4px">${code}</div><p>This code expires in 10 minutes.</p></div>`;

  const t = getTransporter();
  if (!t) {
    console.log('[DEV] OTP code for', toEmail, '=>', code);
    return { devLogged: true };
  }

  const info = await t.sendMail({
    from: process.env.FROM_EMAIL,
    to: toEmail,
    subject,
    text,
    html,
  });
  return info;
}
