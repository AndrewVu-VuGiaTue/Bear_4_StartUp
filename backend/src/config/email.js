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

// Send OTP email
export async function sendOtpEmail(email, otp, purpose = 'signup') {
  const mailOptions = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: 'BEAR'
    },
    replyTo: FROM_EMAIL,
    subject: purpose === 'signup' ? 'BEAR - Verify Your Email' : 'BEAR - Password Reset OTP',
    text: `
BEAR Health

${purpose === 'signup' ? 'Welcome to BEAR!' : 'Password Reset Request'}

${purpose === 'signup' 
  ? 'Thank you for signing up! Please use the following OTP code to verify your email address:' 
  : 'You requested to reset your password. Please use the following OTP code:'}

Your OTP Code: ${otp}

This code will expire in 5 minutes.

If you didn't request this, please ignore this email or contact support if you have concerns.

© 2025 BEAR Health. All rights reserved.
    `.trim(),
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
          <p style="margin-top: 10px;">
            This is a transactional email. You received this because you requested it from the BEAR app.
          </p>
        </div>
      </div>
    `,
    categories: ['otp', purpose === 'signup' ? 'signup' : 'password-reset'],
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false },
    },
  };

  try {
    console.log(`[EMAIL] 📤 Sending OTP to ${email} from ${FROM_EMAIL}...`);
    const response = await sgMail.send(mailOptions);
    
    console.log(`[EMAIL] ✅ OTP sent to ${email} for ${purpose}`);
    console.log(`[EMAIL] SendGrid Response: ${response[0].statusCode}`);
    console.log(`[EMAIL] Message ID: ${response[0].headers['x-message-id']}`);
    console.log(`[EMAIL] 💡 Check SendGrid Activity: https://app.sendgrid.com/email_activity`);
    console.log(`[EMAIL] 💡 If email not received, verify sender at: https://app.sendgrid.com/settings/sender_auth`);
    
    return true;
  } catch (error) {
    console.error('[EMAIL] ❌ Failed to send OTP:', error.message);
    
    if (error.response) {
      console.error('[EMAIL] SendGrid Error Body:', JSON.stringify(error.response.body, null, 2));
      console.error('[EMAIL] SendGrid Error Code:', error.code);
      
      if (error.response.body?.errors) {
        error.response.body.errors.forEach((err) => {
          console.error(`[EMAIL] Error: ${err.message}`);
          if (err.message.includes('verified')) {
            console.error('[EMAIL] 🚨 SENDER NOT VERIFIED! Go to: https://app.sendgrid.com/settings/sender_auth');
          }
        });
      }
    }
    
    return false;
  }
}

// Send critical health alert email to emergency contacts
export async function sendCriticalAlertEmail(to, userName, alertType, alertMessage, timestamp) {
  const mailOptions = {
    to,
    from: {
      email: FROM_EMAIL,
      name: 'BEAR Health Alert'
    },
    replyTo: FROM_EMAIL,
    subject: `🚨 CRITICAL HEALTH ALERT - ${userName}`,
    text: `
CRITICAL HEALTH ALERT

User: ${userName}
Alert Type: ${alertType}
Time: ${new Date(timestamp).toLocaleString()}

${alertMessage}

This is an automated alert from BEAR Health monitoring system.
Please check on ${userName} immediately.

© 2025 BEAR Health. All rights reserved.
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #B31B1B; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🚨 BEAR Health Alert</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #B31B1B; margin-top: 0;">
            CRITICAL HEALTH ALERT
          </h2>
          <div style="background-color: #fff3cd; border-left: 4px solid #B31B1B; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #333; font-weight: bold;">⚠️ Immediate attention required</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">User:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Alert Type:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #B31B1B; font-weight: bold;">${alertType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Time:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${new Date(timestamp).toLocaleString()}</td>
            </tr>
          </table>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
              ${alertMessage}
            </p>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            This is an automated alert from BEAR Health monitoring system.
            Please check on <strong>${userName}</strong> immediately.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 BEAR Health. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
    categories: ['health-alert', 'critical'],
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: true },
    },
  };

  try {
    console.log(`[EMAIL] 🚨 Sending critical alert to ${to}...`);
    const response = await sgMail.send(mailOptions);
    
    console.log(`[EMAIL] ✅ Critical alert sent to ${to}`);
    console.log(`[EMAIL] SendGrid Response: ${response[0].statusCode}`);
    console.log(`[EMAIL] Message ID: ${response[0].headers['x-message-id']}`);
    
    return true;
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send critical alert to ${to}:`, error.message);
    
    if (error.response) {
      console.error('[EMAIL] SendGrid Error Body:', JSON.stringify(error.response.body, null, 2));
      
      if (error.response.body?.errors) {
        error.response.body.errors.forEach((err) => {
          console.error(`[EMAIL] Error: ${err.message}`);
        });
      }
    }
    
    return false;
  }
}

export default sgMail;
