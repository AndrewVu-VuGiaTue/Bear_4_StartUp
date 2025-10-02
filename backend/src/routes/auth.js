import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OtpCode from '../models/OtpCode.js';
import { sendOtpEmail } from '../config/email.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /signup
router.post(
  '/signup',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('displayName').trim().isLength({ min: 1 }).withMessage('Display name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((v, { req }) => v === req.body.password).withMessage('Passwords do not match'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, displayName, email, password } = req.body;
    const uname = String(username || '').trim().toLowerCase();
    const dname = String(displayName || '').trim();
    const em = String(email || '').trim().toLowerCase();

    try {
      const exists = await User.findOne({ $or: [{ username: uname }, { email: em }] });
      
      // If user exists but not verified, delete them and allow re-signup
      if (exists && !exists.isVerified) {
        console.log(`[AUTH] Deleting unverified user: ${exists.email}`);
        await OtpCode.deleteMany({ userId: exists._id });
        await User.deleteOne({ _id: exists._id });
      } else if (exists && exists.isVerified) {
        return res.status(409).json({ message: 'Username or email already in use' });
      }

      // Generate OTP
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store signup data temporarily with OTP (we'll use a temp user with isVerified: false)
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ 
        username: uname, 
        displayName: dname, 
        email: em, 
        passwordHash, 
        isVerified: false  // Not verified until OTP confirmed
      });

      // Save OTP
      await OtpCode.create({
        userId: user._id,
        code: otp,
        expiresAt,
        used: false,
      });

      // Send OTP email
      await sendOtpEmail(em, otp, 'signup');

      return res.status(201).json({ 
        message: 'OTP has been sent to your email. Please verify to complete signup.',
        userId: user._id,
        email: em
      });
    } catch (err) {
      // Handle duplicate key error gracefully
      if (err && err.code === 11000) {
        return res.status(409).json({ message: 'Username or email already in use' });
      }
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /verify-signup-otp - Verify OTP for signup
router.post(
  '/verify-signup-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, otp } = req.body;
    const em = String(email || '').trim().toLowerCase();

    try {
      const user = await User.findOne({ email: em });
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.isVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      const otpRecord = await OtpCode.findOne({
        userId: user._id,
        code: otp,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Mark user as verified
      user.isVerified = true;
      await user.save();

      // Mark OTP as used
      otpRecord.used = true;
      await otpRecord.save();

      return res.json({ message: 'Email verified successfully. You can now sign in.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /resend-signup-otp - Resend OTP for signup
router.post(
  '/resend-signup-otp',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    const em = String(email || '').trim().toLowerCase();

    try {
      const user = await User.findOne({ email: em });
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.isVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      // Generate new OTP
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Delete old OTPs
      await OtpCode.deleteMany({ userId: user._id });

      // Save new OTP
      await OtpCode.create({
        userId: user._id,
        code: otp,
        expiresAt,
        used: false,
      });

      // Send OTP email
      await sendOtpEmail(em, otp, 'signup');

      return res.json({ message: 'OTP has been resent to your email.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /forgot-password - Generate and send OTP
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    const em = String(email || '').trim().toLowerCase();

    try {
      const user = await User.findOne({ email: em });
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: 'If the email exists, an OTP has been sent.' });
      }

      // Generate 6-digit OTP
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Delete old OTPs for this user
      await OtpCode.deleteMany({ userId: user._id });

      // Save new OTP
      await OtpCode.create({
        userId: user._id,
        code: otp,
        expiresAt,
        used: false,
      });

      // Send OTP via email
      await sendOtpEmail(em, otp, 'password reset');

      return res.json({ message: 'OTP has been sent to your email.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /verify-otp - Verify OTP code
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, otp } = req.body;
    const em = String(email || '').trim().toLowerCase();

    try {
      const user = await User.findOne({ email: em });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const otpRecord = await OtpCode.findOne({
        userId: user._id,
        code: otp,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      return res.json({ message: 'OTP verified successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /reset-password - Reset password with OTP
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, otp, newPassword } = req.body;
    const em = String(email || '').trim().toLowerCase();

    try {
      const user = await User.findOne({ email: em });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const otpRecord = await OtpCode.findOne({
        userId: user._id,
        code: otp,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = passwordHash;
      await user.save();

      // Mark OTP as used
      otpRecord.used = true;
      await otpRecord.save();

      return res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /signin
router.post(
  '/signin',
  [
    body('identifier').trim().isLength({ min: 3 }).withMessage('Username or email is required'),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { identifier, password } = req.body;

    try {
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      // Check if user verified their email
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before signing in' });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ sub: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: { id: user._id, username: user.username, displayName: user.displayName, email: user.email },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// PUT /change-display-name - Change user's display name (requires auth)
router.put(
  '/change-display-name',
  authMiddleware,
  [body('displayName').trim().isLength({ min: 1 }).withMessage('Display name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { displayName } = req.body;

    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.displayName = displayName.trim();
      await user.save();

      return res.json({ 
        message: 'Display name updated successfully',
        user: { 
          id: user._id, 
          username: user.username, 
          displayName: user.displayName, 
          email: user.email 
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// PUT /change-password - Change user's password (requires auth)
router.put(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').isLength({ min: 6 }).withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Verify current password
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash and save new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = passwordHash;
      await user.save();

      return res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
