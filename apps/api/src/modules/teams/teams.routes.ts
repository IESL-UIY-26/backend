import { Router } from 'express';
import { protect, requireAdmin } from '../../middlewares/auth.middleware';
import * as TeamsController from './teams.controller';

const router = Router();

// GET /api/teams/my-team (returns authenticated user's team)
router.get('/my-team', protect, TeamsController.getMyTeam);
// POST /api/teams (creates a new team for authenticated user)
router.post('/', protect, TeamsController.createTeam);
// PATCH /api/teams/my-team (leader only; updates authenticated leader's own team)
router.patch('/my-team', protect, TeamsController.updateMyTeam);


// router.get('/', protect, requireAdmin, TeamsController.getTeams);
// router.get('/:id', protect, TeamsController.getTeamById);
// router.patch('/:id', protect, requireAdmin, TeamsController.updateTeam);
// router.delete('/:id', protect, requireAdmin, TeamsController.deleteTeam);

// Update team supervisor (leader only - enforced in service)
// router.patch('/:id/supervisor', protect, TeamsController.updateTeamSupervisor);

export default router;
