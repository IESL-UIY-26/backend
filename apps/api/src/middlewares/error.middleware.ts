import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.statusCode ?? 500;
  console.error(`[Error] ${err.message}`);
  res.status(status).json({ success: false, message: err.message });
};
