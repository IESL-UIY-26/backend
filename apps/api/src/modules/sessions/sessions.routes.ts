import { Router } from 'express';
import { protect, requireAdmin } from '../../middlewares/auth.middleware';
import * as SessionsController from './sessions.controller';

const router = Router();

// ─── Public routes (no auth) ──────────────────────────────────────────────────
router.get('/available', SessionsController.getAvailableSessions);
router.get('/search', SessionsController.searchSessionsByDate);

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

// ─── Session Feedback routes ──────────────────────────────────────────────────
router.post('/:sessionId/feedback', protect, SessionsController.createSessionFeedback);
router.patch('/:sessionId/feedback', protect, SessionsController.updateMySessionFeedback);
router.delete('/:sessionId/feedback', protect, SessionsController.deleteMySessionFeedback);
router.get('/:sessionId/feedback/me', protect, SessionsController.getMySessionFeedback);
router.get('/:sessionId/feedback', protect, requireAdmin, SessionsController.getSessionFeedbacksForAdmin);

export default router;
