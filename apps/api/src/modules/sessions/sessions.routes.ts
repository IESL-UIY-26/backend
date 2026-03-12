import { Router } from 'express';
import { protect, requireAdmin } from '../../middlewares/auth.middleware';
import * as SessionsController from './sessions.controller';

const router = Router();

router.get('/',protect, SessionsController.getSessions);
router.post('/', protect, requireAdmin, SessionsController.createSession);
router.patch('/:id', protect, requireAdmin, SessionsController.updateSession);
router.delete('/:id', protect, requireAdmin, SessionsController.deleteSession);

export default router;
