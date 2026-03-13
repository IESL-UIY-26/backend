import type { Request, Response } from 'express';
import { VotingService } from './voting.service';
import { VoteProjectParamsSchema } from './vote.model';

export class VotingController {
  static async createVote(req: Request, res: Response) {
    const { projectId } = VoteProjectParamsSchema.parse(req.params);
    const userId = req.user!.id;

    const vote = await VotingService.createVote(projectId, userId);

    res.status(201).json({ success: true, data: vote });
  }

  static async removeVote(req: Request, res: Response) {
    const { projectId } = VoteProjectParamsSchema.parse(req.params);
    const userId = req.user!.id;

    await VotingService.removeVote(projectId, userId);

    res.json({ success: true });
  }
}