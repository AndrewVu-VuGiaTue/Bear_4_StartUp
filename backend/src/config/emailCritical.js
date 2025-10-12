import nodemailer from 'nodemailer';

// Send critical alert email to emergency contacts
export async function sendCriticalAlertEmail(to, userName, alertType, alertMessage, timestamp) {
  // Use Gmail SMTP (you need to set EMAIL_USER and EMAIL_PASS in .env)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'buddyforemergencyaandr@gmail.com',
      pass: process.env.EMAIL_PASS, // App password from Google
    },
  });

  const mailOptions = {
    from: `"BEAR Health Alert" <${process.env.EMAIL_USER || 'buddyforemergencyaandr@gmail.com'}>`,
    to,
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
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Critical alert sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Error sending critical alert:', error);
    return false;
  }
}
