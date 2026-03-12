import type { Request, Response, NextFunction } from 'express';
import * as UniversitiesService from './universities.service';
import { CreateUniversitySchema } from './universities.model';

export const getUniversities = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const universities = await UniversitiesService.getUniversities();
    res.json({ success: true, data: universities });
  } catch (err) {
    next(err);
  }
};

export const createUniversity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = CreateUniversitySchema.parse(req.body);
    const university = await UniversitiesService.createUniversity(name);
    res.status(201).json({ success: true, data: university });
  } catch (err) {
    next(err);
  }
};

export const updateUniversity = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = CreateUniversitySchema.parse(req.body);
    const university = await UniversitiesService.updateUniversity(req.params['id']!, name);
    res.json({ success: true, data: university });
  } catch (err) {
    next(err);
  }
};

export const deleteUniversity = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await UniversitiesService.deleteUniversity(req.params['id']!);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
