import type { Request, Response, NextFunction } from 'express';
import * as UserService from './user.service';

export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = (req.query.email as string | undefined) ?? '';
    if (email.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }
    const users = await UserService.searchUsersByEmail(email);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};
