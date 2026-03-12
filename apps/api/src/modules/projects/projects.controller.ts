import type { Request, Response } from 'express';
import { ProjectsService } from './projects.service';
import { createProjectSchema, updateProjectSchema } from './projects.dtos';

export class ProjectsController {
  static async getAllProjectsPublic(_req: Request, res: Response) {
    const projects = await ProjectsService.getAllProjectsPublic();
    res.json({ success: true, data: projects });
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
