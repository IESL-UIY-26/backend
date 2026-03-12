import type { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { z } from 'zod';

const SyncBodySchema = z.object({
  full_name: z.string().min(1).optional(),
});

/**
 * POST /api/auth/sync
 * Verifies the Supabase JWT from the Authorization header and upserts the
 * user profile in Neon DB.  Works for both email/password and OAuth flows.
 * Body: { full_name?: string }
 */
export const syncUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.slice(7);
    const { full_name } = SyncBodySchema.parse(req.body);
    const user = await AuthService.syncUser(token, full_name);

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
