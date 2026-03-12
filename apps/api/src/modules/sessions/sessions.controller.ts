import type { Request, Response, NextFunction } from 'express';
import * as SessionsService from './sessions.service';
import { CreateSessionSchema, UpdateSessionSchema } from './sessions.model';

export const getSessions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await SessionsService.getSessions();
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
};

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = CreateSessionSchema.parse(req.body);
    const session = await SessionsService.createSession({
      ...data,
      created_by: req.user!.id,
    });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const updateSession = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = UpdateSessionSchema.parse(req.body);
    const session = await SessionsService.updateSession(req.params.id, data);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

export const deleteSession = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await SessionsService.deleteSession(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
