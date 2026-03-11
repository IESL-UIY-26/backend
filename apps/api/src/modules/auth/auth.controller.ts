import type { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await AuthService.register(req.body as Parameters<typeof AuthService.register>[0]);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.login(req.body as Parameters<typeof AuthService.login>[0]);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
