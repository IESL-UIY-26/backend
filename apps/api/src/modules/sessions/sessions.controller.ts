import type { Request, Response, NextFunction } from 'express';
import * as SessionsService from './sessions.service';
import {
  CreateSessionFeedbackSchema,
  CreateSessionSchema,
  UpdateSessionFeedbackSchema,
  UpdateSessionSchema,
} from './sessions.model';

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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawPage = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const parsedPage = Number.parseInt(String(rawPage ?? '1'), 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const limit = 10;
    const result = await SessionsService.getAvailableSessions(page, limit);

    res.json({
      success: true,
      data: result.sessions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
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

// ─── Session Feedback ─────────────────────────────────────────────────────────

export const createSessionFeedback = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = CreateSessionFeedbackSchema.parse(req.body);
    const feedback = await SessionsService.createSessionFeedback(req.params.sessionId, req.user!.id, data);
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};

export const updateMySessionFeedback = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = UpdateSessionFeedbackSchema.parse(req.body);
    const feedback = await SessionsService.updateMySessionFeedback(req.params.sessionId, req.user!.id, data);
    res.json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};

export const deleteMySessionFeedback = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await SessionsService.deleteMySessionFeedback(req.params.sessionId, req.user!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getSessionFeedbacksForAdmin = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const feedbacks = await SessionsService.getSessionFeedbacksForAdmin(req.params.sessionId);
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    next(err);
  }
};

export const getMySessionFeedback = async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const feedback = await SessionsService.getMySessionFeedback(req.params.sessionId, req.user!.id);
    res.json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};
