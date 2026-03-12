import { Router } from 'express';
import { protect, requireAdmin } from '../../middlewares/auth.middleware';
import * as UniversitiesController from './universities.controller';

const router = Router();

router.get('/', protect, UniversitiesController.getUniversities);
router.post('/', protect, requireAdmin, UniversitiesController.createUniversity);
router.patch('/:id', protect, requireAdmin, UniversitiesController.updateUniversity);
router.delete('/:id', protect, requireAdmin, UniversitiesController.deleteUniversity);

export default router;
