import { Router } from 'express';
import * as AuthController from './auth.controller';

const router = Router();

/**
 *POST /api/auth/register
 *Creates a new user in Supabase Auth and stores their profile in the Neon DB.
 *Body: { full_name, email, password, contact_number?, gender?, address?, date_of_birth? }
 *Returns: 201 with the created user profile.
 */
router.post('/register', AuthController.register);

/**
 *POST /api/auth/login
 *Authenticates a user via Supabase Auth using email and password.
 *Body: { email, password }
 *Returns: 200 with access_token and refresh_token.
*/
router.post('/login', AuthController.login);

export default router;
