import { Router } from 'express';
import { protect, requireAdmin } from '../../middlewares/auth.middleware';
import * as TeamsController from './teams.controller';

const router = Router();

// router.get('/', protect, requireAdmin, TeamsController.getTeams);
router.get('/my-team', protect, TeamsController.getMyTeam);
// router.get('/:id', protect, TeamsController.getTeamById);
router.post('/', protect, TeamsController.createTeam);
// router.patch('/:id', protect, requireAdmin, TeamsController.updateTeam);
// router.delete('/:id', protect, requireAdmin, TeamsController.deleteTeam);

// Update team supervisor (leader only - enforced in service)
router.patch('/:id/supervisor', protect, TeamsController.updateTeamSupervisor);

export default router;
