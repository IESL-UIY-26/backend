import type { Request, Response, NextFunction } from 'express';
import * as TeamsService from './teams.service';
import { CreateTeamSchema, UpdateTeamSchema, UpdateTeamSupervisorSchema } from './teams.model';

export const getMyTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await TeamsService.getMyTeam(req.user!.id);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

export const getTeams = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teams = await TeamsService.getTeams();
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
};

export const getTeamById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const team = await TeamsService.getTeamById(req.params.id);
    if (!team) {
      res.status(404).json({ success: false, message: 'Team not found' });
      return;
    }
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Inject the authenticated user's ID as the LEADER member's user_id
    // so users cannot impersonate another leader
    const rawBody = req.body as {
      members?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    };
    if (Array.isArray(rawBody.members)) {
      rawBody.members = rawBody.members.map((m) =>
        m.role === 'LEADER' ? { ...m, user_id: req.user!.id } : m
      );
    }
    const data = CreateTeamSchema.parse(rawBody);
    const team = await TeamsService.createTeam(data);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

export const updateTeam = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = UpdateTeamSchema.parse(req.body);
    const team = await TeamsService.updateTeam(req.params.id, data);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};

export const deleteTeam = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await TeamsService.deleteTeam(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const updateTeamSupervisor = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = UpdateTeamSupervisorSchema.parse(req.body);
    const team = await TeamsService.updateTeamSupervisor(req.params.id, req.user!.id, data);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
};
