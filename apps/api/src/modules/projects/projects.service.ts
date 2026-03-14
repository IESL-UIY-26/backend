import { prisma } from '../../config/db';
import type { CreateProjectDto, UpdateProjectDto } from './projects.dtos';

export class ProjectsService {
  static async getAllProjectsPublic(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          team_id: true,
          title: true,
          description: true,
          image_url: true,
          youtube_link: true,
          pdf: true,
          github_url: true,
          vote_count: true,
          created_at: true,
          team: {
            select: {
              id: true,
              team_name: true,
              university: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.project.count(),
    ]);

    return {
      projects,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  static async searchProjectsByName(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
      title: {
        contains: query,
        mode: 'insensitive' as const,
      },
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          team_id: true,
          title: true,
          description: true,
          image_url: true,
          youtube_link: true,
          pdf: true,
          github_url: true,
          vote_count: true,
          created_at: true,
          team: {
            select: {
              id: true,
              team_name: true,
              university: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

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

  static async isTeamMember(userId: string, teamId: string): Promise<boolean> {
    const member = await prisma.teamMember.findFirst({
      where: {
        user_id: userId,
        team_id: teamId,
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
  static async getProjectsByTeam(teamId: string, userId: string) {
    const isMember = await this.isTeamMember(userId, teamId);
    if (!isMember) {
      const err = new Error('Only members of this team can view team projects');
      (err as any).statusCode = 403;
      throw err;
    }

    return prisma.project.findMany({
      where: { team_id: teamId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get a single project
   */
  static async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      const err = new Error('Project not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const isMember = await this.isTeamMember(userId, project.team_id);
    if (!isMember) {
      const err = new Error('Only members of this team can view this project');
      (err as any).statusCode = 403;
      throw err;
    }

    return project;
  }
}
