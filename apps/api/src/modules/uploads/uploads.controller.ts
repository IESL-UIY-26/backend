import type { Request, Response, NextFunction } from 'express';
import * as UploadsService from './uploads.service';

export const uploadTemp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file provided' });
            return;
        }
        const file = req.file;
        const out = await UploadsService.uploadTempFile(file.buffer, file.originalname, req.user!.id);
        res.json({ success: true, data: out });
    } catch (err) {
        next(err);
    }
};

export const uploadTeamMemberIdCard = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file provided' });
            return;
        }
        const file = req.file;
        const out = await UploadsService.uploadTeamMemberIdCard(req.params.id, file.buffer, file.originalname, req.user!.id);
        res.json({ success: true, data: out });
    } catch (err) {
        next(err);
    }
};

export default { uploadTemp, uploadTeamMemberIdCard };
