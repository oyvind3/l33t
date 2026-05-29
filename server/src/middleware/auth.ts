import { Request, Response, NextFunction } from 'express';
import db from '../db.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string | undefined;
  if (userId) {
    const user = db.prepare('SELECT id, username, isAdmin FROM users WHERE id = ?').get(userId) as
      | { id: string; username: string; isAdmin: number }
      | undefined;
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        isAdmin: !!user.isAdmin,
      };
    }
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (!req.user.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
