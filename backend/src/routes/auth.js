import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
// OTP disabled: no OtpCode or email sending

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
      if (exists) return res.status(409).json({ message: 'Username or email already in use' });

      const passwordHash = await bcrypt.hash(password, 10);
      // Mark user as verified immediately (OTP flow disabled)
      const user = await User.create({ username: uname, displayName: dname, email: em, passwordHash, isVerified: true });

      return res.status(201).json({ message: 'Sign up successful.', userId: user._id });
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

// POST /verify-otp
router.post('/verify-otp', async (_req, res) => {
  return res.status(410).json({ message: 'OTP verification is disabled.' });
});

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

      // OTP disabled: user is verified on sign up

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
