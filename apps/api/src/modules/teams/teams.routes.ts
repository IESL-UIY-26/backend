import { Router } from 'express';
import { protect, requireAdmin } from '../../middlewares/auth.middleware';
import * as TeamsController from './teams.controller';

const router = Router();

router.get('/', protect, requireAdmin, TeamsController.getTeams);
router.get('/:id', protect, TeamsController.getTeamById);
router.post('/', protect, TeamsController.createTeam);
router.patch('/:id', protect, requireAdmin, TeamsController.updateTeam);
router.delete('/:id', protect, requireAdmin, TeamsController.deleteTeam);

export default router;
