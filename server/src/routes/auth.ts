import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const { name, email, password, company } = req.body;
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  if (!config.dbConnected) {
    const token = jwt.sign(
      { id: '000000000000000000000001', email, name, role: 'admin', isDemo: true },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    return res.status(201).json({
      success: true,
      token,
      user: { _id: '000000000000000000000001', name, email, company, role: 'admin' },
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    company,
  });

  const token = jwt.sign(
    { id: String(user._id), email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, company: user.company, role: user.role },
  });
}));

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (!config.dbConnected) {
    const token = jwt.sign(
      { id: '000000000000000000000001', email, name: 'Alex Rivera', role: 'admin', isDemo: true },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    return res.json({
      success: true,
      token,
      user: { _id: '000000000000000000000001', name: 'Alex Rivera', email, company: 'EchoSales AI', role: 'admin' },
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    { id: String(user._id), email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, company: user.company, role: user.role },
  });
}));

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  if (!config.dbConnected || req.user?.isDemo) {
    return res.json({
      success: true,
      user: {
        _id: req.user?.id || '000000000000000000000001',
        name: req.user?.name || 'Alex Rivera (Demo)',
        email: req.user?.email || 'demo@echosales.ai',
        company: 'EchoSales AI',
        role: 'admin',
      },
    });
  }

  const user = await User.findById(req.user?.id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json({ success: true, user });
}));

export default router;
