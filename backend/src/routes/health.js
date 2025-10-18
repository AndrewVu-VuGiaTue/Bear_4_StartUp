import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import { sendCriticalAlertEmail } from '../config/email.js';

const router = express.Router();

// POST /health/alert - Send critical health alert to emergency contacts
router.post('/alert', authMiddleware, async (req, res) => {
  try {
    const { alertType, heartRate, spo2, temperature, message } = req.body;

    // Get user with emergency contacts
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has emergency contacts
    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      console.log('[HEALTH] No emergency contacts found for user:', user.username);
      return res.json({ 
        message: 'Alert logged but no emergency contacts to notify',
        sent: 0
      });
    }

    // Build alert message - always include vital signs
    let alertMessage = message || 'Critical health alert detected.';
    
    // Always show vital signs section
    alertMessage += '\n\nVital Signs:';
    
    // Always show HR and SpO2 (even if null, show as "N/A")
    if (heartRate !== null && heartRate !== undefined) {
      alertMessage += `\n- Heart Rate: ${heartRate} BPM`;
    } else {
      alertMessage += `\n- Heart Rate: N/A`;
    }
    
    if (spo2 !== null && spo2 !== undefined) {
      alertMessage += `\n- SpO2: ${spo2}%`;
    } else {
      alertMessage += `\n- SpO2: N/A`;
    }
    
    if (temperature !== null && temperature !== undefined) {
      alertMessage += `\n- Temperature: ${temperature}°C`;
    }

    // Send email to all emergency contacts
    const timestamp = new Date();
    let sentCount = 0;
    const failedContacts = [];

    for (const contact of user.emergencyContacts) {
      try {
        const success = await sendCriticalAlertEmail(
          contact.email,
          user.displayName || user.username,
          alertType || 'Critical Health Alert',
          alertMessage,
          timestamp
        );
        
        if (success) {
          sentCount++;
          console.log(`[HEALTH] Alert sent to ${contact.email}`);
        } else {
          failedContacts.push(contact.email);
          console.error(`[HEALTH] Failed to send alert to ${contact.email}`);
        }
      } catch (err) {
        failedContacts.push(contact.email);
        console.error(`[HEALTH] Error sending to ${contact.email}:`, err);
      }
    }

    return res.json({
      message: `Alert sent to ${sentCount} of ${user.emergencyContacts.length} contacts`,
      sent: sentCount,
      total: user.emergencyContacts.length,
      failed: failedContacts.length > 0 ? failedContacts : undefined
    });

  } catch (err) {
    console.error('[HEALTH] Error sending alert:', err);
    return res.status(500).json({ message: 'Failed to send alert' });
  }
});

// GET /health/status - Check health monitoring status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      emergencyContactsCount: user.emergencyContacts?.length || 0,
      hasEmergencyContacts: (user.emergencyContacts?.length || 0) > 0
    });
  } catch (err) {
    console.error('[HEALTH] Error checking status:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
