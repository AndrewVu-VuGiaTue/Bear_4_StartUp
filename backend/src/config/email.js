import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'buddyforemergencyaandr@gmail.com';

if (!SENDGRID_API_KEY) {
  console.warn('[EMAIL] ⚠️  SENDGRID_API_KEY not found in environment variables!');
  console.warn('[EMAIL] Email sending will fail until you add SENDGRID_API_KEY to your .env file');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('[EMAIL] ✅ SendGrid initialized successfully');
}

// Send OTP email using SendGrid
export async function sendOtpEmail(email, otp, purpose = 'password reset') {
  if (!SENDGRID_API_KEY) {
    console.error('[EMAIL] ❌ Cannot send email: SENDGRID_API_KEY not configured');
    return false;
  }

  const mailOptions = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: 'BEAR Health'
    },
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
    // Send email via SendGrid
    const response = await sgMail.send(mailOptions);
    console.log(`[EMAIL] ✅ OTP sent to ${email} for ${purpose}`);
    console.log(`[EMAIL] SendGrid Response: ${response[0].statusCode}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] ❌ Failed to send OTP:', error.message);
    
    // Log detailed error for debugging
    if (error.response) {
      console.error('[EMAIL] SendGrid Error Body:', error.response.body);
      console.error('[EMAIL] SendGrid Error Code:', error.code);
    }
    
    return false;
  }
}

export default sgMail;
