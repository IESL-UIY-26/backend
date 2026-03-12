import { Router } from 'express';
import * as AuthController from './auth.controller';

const router = Router();

/**
 * POST /api/auth/sync
 * Called by the frontend after any successful sign-in or sign-up
 * (email/password or OAuth).  Verifies the Supabase JWT from the
 * Authorization header and upserts the user profile in Neon DB.
 *
 * Headers: Authorization: Bearer <supabase-access-token>
 * Body:    { full_name?: string }  — supply on first email/password registration
 * Returns: 200 with the user profile.
 */
router.post('/sync', AuthController.syncUser);

export default router;
