import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { prisma } from '../config/db';

// Augment Express Request so downstream handlers can access req.user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
      file?: Express.Multer.File;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }

  req.user = { id: user.id, email: user.email ?? '' };
  next();
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { role: true },
  });
  if (!dbUser || dbUser.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
};
