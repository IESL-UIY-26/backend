import { Router } from 'express';
import multer from 'multer';
import { protect } from '../../middlewares/auth.middleware';
import * as UploadsService from './uploads.service';

const router = Router();
const upload = multer();

// Temporary upload (no DB) - returns imagekit URL
router.post('/temp', protect, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
        const out = await UploadsService.uploadTempFile(req.file.buffer, req.file.originalname, req.user!.id);
        res.json({ success: true, data: out });
    } catch (err) {
        next(err);
    }
});

// Delete temporary upload by ImageKit fileId
router.delete('/temp/:fileId', protect, async (req, res, next) => {
    try {
        const fileId = Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId;
        const out = await UploadsService.deleteTempFile(fileId, req.user!.id);
        res.json({ success: true, data: out });
    } catch (err) {
        next(err);
    }
});

// Project image upload (leader only)
router.post('/project-image', protect, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
        const bodyTeamId = Array.isArray(req.body?.teamId) ? req.body.teamId[0] : req.body?.teamId;
        const teamId = typeof bodyTeamId === 'string' ? bodyTeamId : '';
        const out = await UploadsService.uploadProjectImage(teamId, req.file.buffer, req.file.originalname, req.user!.id);
        res.json({ success: true, data: out });
    } catch (err) {
        next(err);
    }
});

// Upload and persist to a team member record
router.post('/team-members/:id/id-card', protect, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
        const teamMemberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const out = await UploadsService.uploadTeamMemberIdCard(teamMemberId, req.file.buffer, req.file.originalname, req.user!.id);
        res.json({ success: true, data: out });
    } catch (err) {
        next(err);
    }
});

export default router;
