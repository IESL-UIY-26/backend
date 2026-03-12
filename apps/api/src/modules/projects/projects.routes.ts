import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { ProjectsController } from './projects.controller';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

// Team projects
router.get('/teams/:teamId/projects', ProjectsController.getProjectsByTeam);
router.post('/teams/:teamId/projects', ProjectsController.createProject);

// Individual project operations (leader only - enforced in service)
router.get('/projects/:projectId', ProjectsController.getProjectById);
router.patch('/projects/:projectId', ProjectsController.updateProject);
router.delete('/projects/:projectId', ProjectsController.deleteProject);

export default router;
