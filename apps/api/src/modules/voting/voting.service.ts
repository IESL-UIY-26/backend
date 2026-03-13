import { prisma } from '../../config/db';

export class VotingService {
  static async createVote(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      const err = new Error('Project not found');
      (err as any).statusCode = 404;
      throw err;
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
      },
      select: { id: true },
    });

    if (existingVote) {
      const err = new Error('You have already voted for this project');
      (err as any).statusCode = 409;
      throw err;
    }

    try {
      const [vote] = await prisma.$transaction([
        prisma.vote.create({
          data: {
            project_id: projectId,
            user_id: userId,
          },
        }),
        prisma.project.update({
          where: { id: projectId },
          data: {
            vote_count: {
              increment: 1,
            },
          },
        }),
      ]);

      return vote;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const err = new Error('You have already voted for this project');
        (err as any).statusCode = 409;
        throw err;
      }
      throw error;
    }
  }

  static async removeVote(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      const err = new Error('Project not found');
      (err as any).statusCode = 404;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      const deleted = await tx.vote.deleteMany({
        where: {
          project_id: projectId,
          user_id: userId,
        },
      });

      if (deleted.count === 0) {
        const err = new Error('Vote not found for this user and project');
        (err as any).statusCode = 404;
        throw err;
      }

      await tx.project.update({
        where: { id: projectId },
        data: {
          vote_count: {
            decrement: 1,
          },
        },
      });
    });

    return { success: true };
  }
}