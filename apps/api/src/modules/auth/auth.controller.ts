import type { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { RegisterSchema, LoginSchema } from './auth.model';


export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto = RegisterSchema.parse(req.body);   
    const user = await AuthService.register(dto);
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
    const dto = LoginSchema.parse(req.body);  
    const result = await AuthService.login(dto);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
