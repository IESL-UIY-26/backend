import type { Request, Response, NextFunction } from 'express';
import * as UserService from './user.service';
import { UpdateMyProfileSchema } from './user.model';

export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = ((req.query.q as string | undefined) ?? (req.query.email as string | undefined) ?? '').trim();
    if (query.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }
    const users = await UserService.searchUsers(query);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await UserService.getMyProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = UpdateMyProfileSchema.parse(req.body);
    const profile = await UserService.updateMyProfile(req.user!.id, payload);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};
