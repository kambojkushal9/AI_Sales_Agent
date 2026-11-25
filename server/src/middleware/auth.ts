import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isDemo?: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const DEMO_USER: AuthUser = {
  id: '000000000000000000000001',
  email: 'demo@echosales.ai',
  name: 'Alex Rivera (Demo)',
  role: 'admin',
  isDemo: true,
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow seamless demo access when x-demo-mode header is present or no token in demo
    if (req.headers['x-demo-mode'] === 'true') {
      req.user = DEMO_USER;
      next();
      return;
    }
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (token === 'demo-token') {
    req.user = DEMO_USER;
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === 'demo-token') {
      req.user = DEMO_USER;
    } else {
      try {
        req.user = jwt.verify(token, config.jwtSecret) as AuthUser;
      } catch {
        req.user = DEMO_USER;
      }
    }
  } else {
    req.user = DEMO_USER;
  }
  next();
};
