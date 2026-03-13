import { Router } from 'express';
import { protect, requireAdmin } from '../../middlewares/auth.middleware';
import * as SessionsController from './sessions.controller';

const router = Router();

// ─── Public routes (no auth) ──────────────────────────────────────────────────
router.get('/available', SessionsController.getAvailableSessions);

// ─── Auth required ─────────────────────────────────────────────────────────
// Specific literal paths must come before /:sessionId param routes
router.get('/my-registrations', protect, SessionsController.getMyRegistrations);

router.get('/', protect, SessionsController.getSessions);
router.post('/', protect, requireAdmin, SessionsController.createSession);
router.patch('/:id', protect, requireAdmin, SessionsController.updateSession);
router.delete('/:id', protect, requireAdmin, SessionsController.deleteSession);

// ─── Participant / registration routes ────────────────────────────────────────
router.post('/:sessionId/register', protect, SessionsController.registerForSession);
router.delete('/:sessionId/register', protect, SessionsController.unregisterFromSession);
router.get('/:sessionId/registration-status', protect, SessionsController.getMyRegistrationStatus);
router.get('/:sessionId/participants', protect, requireAdmin, SessionsController.getSessionParticipants);

export default router;
