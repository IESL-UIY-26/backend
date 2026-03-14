import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { ProjectsController } from './projects.controller';

const router = Router({ mergeParams: true });

// Public route (no authentication required)
router.get('/public/projects', ProjectsController.getAllProjectsPublic);
router.get('/public/projects/search', ProjectsController.searchProjectsByName);

// All routes require authentication
router.use(protect);

// Team members only - enforced in service
router.get('/teams/:teamId/projects', ProjectsController.getProjectsByTeam);
// Leader only - enforced in service
router.post('/teams/:teamId/projects', ProjectsController.createProject);
// Team members only - enforced in service
router.get('/projects/:projectId', ProjectsController.getProjectById);
// Leader only - enforced in service
router.patch('/projects/:projectId', ProjectsController.updateProject);
// Leader only - enforced in service
router.delete('/projects/:projectId', ProjectsController.deleteProject);

export default router;
