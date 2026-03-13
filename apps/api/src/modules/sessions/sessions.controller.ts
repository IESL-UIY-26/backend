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

export const getAvailableSessions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await SessionsService.getAvailableSessions();
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

// ─── Session Registration ─────────────────────────────────────────────────────

export const registerForSession = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const registration = await SessionsService.registerForSession(req.params.sessionId, req.user!.id);
    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

export const unregisterFromSession = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await SessionsService.unregisterFromSession(req.params.sessionId, req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getMyRegistrations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const registrations = await SessionsService.getMyRegistrations(req.user!.id);
    res.json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
};

export const getMyRegistrationStatus = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = await SessionsService.getMyRegistrationStatus(req.params.sessionId, req.user!.id);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

export const getSessionParticipants = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const participants = await SessionsService.getSessionParticipants(req.params.sessionId);
    res.json({ success: true, data: participants });
  } catch (err) {
    next(err);
  }
};
