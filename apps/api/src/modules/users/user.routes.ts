import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import * as UserController from './user.controller';

const router = Router();

router.get('/me', protect, UserController.getMyProfile);
router.patch('/me', protect, UserController.updateMyProfile);

// GET /api/users/search?email=<query>
router.get('/search', protect, UserController.searchUsers);

export default router;
