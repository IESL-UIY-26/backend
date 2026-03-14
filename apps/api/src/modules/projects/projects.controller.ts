import type { Request, Response } from 'express';
import { ProjectsService } from './projects.service';
import { createProjectSchema, updateProjectSchema } from './projects.dtos';

export class ProjectsController {
  static async getAllProjectsPublic(req: Request, res: Response) {
    const rawPage = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const parsedPage = Number.parseInt(String(rawPage ?? '1'), 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const limit = 10;
    const result = await ProjectsService.getAllProjectsPublic(page, limit);

    res.json({
      success: true,
      data: result.projects,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  static async createProject(req: Request, res: Response) {
    const teamId = req.params.teamId as string;
    const userId = req.user!.id;

    const data = createProjectSchema.parse(req.body);
    const project = await ProjectsService.createProject(teamId, userId, data);

    res.status(201).json({ success: true, data: project });
  }

  static async updateProject(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const userId = req.user!.id;

    const data = updateProjectSchema.parse(req.body);
    const project = await ProjectsService.updateProject(projectId, userId, data);

    res.json({ success: true, data: project });
  }

  static async deleteProject(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const userId = req.user!.id;

    await ProjectsService.deleteProject(projectId, userId);

    res.json({ success: true });
  }

  static async getProjectsByTeam(req: Request, res: Response) {
    const teamId = req.params.teamId as string;
    const userId = req.user!.id;

    const projects = await ProjectsService.getProjectsByTeam(teamId, userId);

    res.json({ success: true, data: projects });
  }

  static async getProjectById(req: Request, res: Response) {
    const projectId = req.params.projectId as string;
    const userId = req.user!.id;

    const project = await ProjectsService.getProjectById(projectId, userId);

    res.json({ success: true, data: project });
  }

}
