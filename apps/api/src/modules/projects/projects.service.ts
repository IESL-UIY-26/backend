import { prisma } from '../../config/db';
import type { CreateProjectDto, UpdateProjectDto } from './projects.dtos';

export class ProjectsService {
  /**
   * Check if a user is the team leader
   */
  static async isTeamLeader(userId: string, teamId: string): Promise<boolean> {
    const member = await prisma.teamMember.findFirst({
      where: {
        user_id: userId,
        team_id: teamId,
        role: 'LEADER',
      },
    });
    return !!member;
  }

  /**
   * Create a project (leader only)
   */
  static async createProject(teamId: string, userId: string, data: CreateProjectDto) {
    const isLeader = await this.isTeamLeader(userId, teamId);
    if (!isLeader) {
      const err = new Error('Only team leader can create projects');
      (err as any).statusCode = 403;
      throw err;
    }

    const project = await prisma.project.create({
      data: {
        ...data,
        team_id: teamId,
      },
    });

    return project;
  }

  /**
   * Update a project (leader only)
   */
  static async updateProject(projectId: string, userId: string, data: UpdateProjectDto) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });

    if (!project) {
      const err = new Error('Project not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const isLeader = await this.isTeamLeader(userId, project.team_id);
    if (!isLeader) {
      const err = new Error('Only team leader can edit projects');
      (err as any).statusCode = 403;
      throw err;
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    return updated;
  }

  /**
   * Delete a project (leader only)
   */
  static async deleteProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });

    if (!project) {
      const err = new Error('Project not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const isLeader = await this.isTeamLeader(userId, project.team_id);
    if (!isLeader) {
      const err = new Error('Only team leader can delete projects');
      (err as any).statusCode = 403;
      throw err;
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { success: true };
  }

  /**
   * Get all projects for a team
   */
  static async getProjectsByTeam(teamId: string) {
    return prisma.project.findMany({
      where: { team_id: teamId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a single project
   */
  static async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      const err = new Error('Project not found');
      (err as any).statusCode = 404;
      throw err;
    }

    return project;
  }
}
