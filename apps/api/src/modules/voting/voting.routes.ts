import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { VotingController } from './voting.controller';

const router = Router();

router.use(protect);

router.post('/projects/:projectId/vote', VotingController.createVote);
router.delete('/projects/:projectId/vote', VotingController.removeVote);

export default router;