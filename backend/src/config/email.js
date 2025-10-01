import nodemailer from 'nodemailer';

// Email configuration - Try multiple ports for Render compatibility
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // TLS port (more likely to work on Render)
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'buddyforemergencyaandr@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'rupy ibwl xsdp abfv',
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Send OTP email
export async function sendOtpEmail(email, otp, purpose = 'password reset') {
  const mailOptions = {
    from: '"BEAR Health" <buddyforemergencyaandr@gmail.com>',
    to: email,
    subject: purpose === 'signup' ? 'BEAR - Verify Your Email' : 'BEAR - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #B31B1B; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">BEAR Health</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #B31B1B; margin-top: 0;">
            ${purpose === 'signup' ? 'Welcome to BEAR!' : 'Password Reset Request'}
          </h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            ${purpose === 'signup' 
              ? 'Thank you for signing up! Please use the following OTP code to verify your email address:' 
              : 'You requested to reset your password. Please use the following OTP code:'}
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <h1 style="color: #B31B1B; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
              ${otp}
            </h1>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This code will expire in <strong>5 minutes</strong>.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            If you didn't request this, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2025 BEAR Health. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    // Verify connection first
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified');
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${email} for ${purpose}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP:', error.message);
    console.error('[EMAIL] Error code:', error.code);
    console.error('[EMAIL] Error command:', error.command);
    
    // Log for debugging
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.error('[EMAIL] Connection timeout - SMTP port may be blocked on this server');
      console.error('[EMAIL] Consider using a different email service (SendGrid, Resend, etc.)');
    }
    
    return false;
  }
}

export default transporter;
