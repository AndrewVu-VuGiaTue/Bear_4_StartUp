import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OtpCode from '../models/OtpCode.js';
import { sendOtpEmail } from '../utils/email.js';

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

    try {
      const exists = await User.findOne({ $or: [{ username }, { email }] });
      if (exists) return res.status(409).json({ message: 'Username or email already in use' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ username, displayName, email, passwordHash, isVerified: false });

      // Create OTP
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await OtpCode.create({ userId: user._id, code, expiresAt });

      await sendOtpEmail(email, code);

      return res.status(201).json({ message: 'Sign up successful. Please verify OTP sent to your email.', userId: user._id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST /verify-otp
router.post(
  '/verify-otp',
  [
    body('email').optional().isEmail(),
    body('userId').optional().isString(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, userId, code } = req.body;

    try {
      let user = null;
      if (userId) user = await User.findById(userId);
      else if (email) user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const otp = await OtpCode.findOne({ userId: user._id, code, used: false }).sort({ createdAt: -1 });
      if (!otp) return res.status(400).json({ message: 'Invalid code' });
      if (otp.expiresAt.getTime() < Date.now()) return res.status(400).json({ message: 'Code expired' });

      user.isVerified = true;
      await user.save();

      otp.used = true;
      await otp.save();

      return res.json({ message: 'Verification successful' });
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

      if (!user.isVerified) return res.status(403).json({ message: 'Account not verified. Please check your email.' });

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

export default router;
