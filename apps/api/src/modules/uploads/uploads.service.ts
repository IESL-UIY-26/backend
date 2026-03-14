import { deleteFileById, uploadBuffer } from '../../utils/imagekit';
import { prisma } from '../../config/db';
import * as TeamsService from '../teams/teams.service';

export const uploadTempFile = async (buffer: Buffer, originalName: string, userId: string) => {
    const safeName = originalName || `upload-${Date.now()}`;
    const resp = await uploadBuffer(buffer, safeName);
    return { url: resp.url, fileId: resp.fileId };
};

export const deleteTempFile = async (fileId: string, userId: string) => {
    if (!fileId) {
        const err = new Error('fileId is required') as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
    }

    await deleteFileById(fileId);
    return { fileId };
};

export const uploadProjectImage = async (
    teamId: string,
    buffer: Buffer,
    originalName: string,
    userId: string
) => {
    if (!teamId) {
        const err = new Error('teamId is required') as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
    }

    const isLeader = await TeamsService.isTeamLeader(userId, teamId);
    if (!isLeader) {
        const err = new Error('Only team leader can upload project image') as Error & { statusCode?: number };
        err.statusCode = 403;
        throw err;
    }

    const safeName = originalName || `project-image-${Date.now()}`;
    const resp = await uploadBuffer(buffer, safeName);
    return { url: resp.url, fileId: resp.fileId };
};

export const uploadTeamMemberIdCard = async (
    teamMemberId: string,
    buffer: Buffer,
    originalName: string,
    userId: string
) => {
    // Ensure caller is allowed to update this team member: either the member themself or the team leader
    const tm = await prisma.teamMember.findUnique({ where: { id: teamMemberId } });
    if (!tm) {
        const err = new Error('Team member not found') as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
    }

    const isOwner = tm.user_id === userId;
    const isLeader = await TeamsService.isTeamLeader(userId, tm.team_id);
    if (!isOwner && !isLeader) {
        const err = new Error('Not authorized to update this team member') as Error & { statusCode?: number };
        err.statusCode = 403;
        throw err;
    }

    const resp = await uploadBuffer(buffer, originalName);

    const updated = await prisma.teamMember.update({
        where: { id: teamMemberId },
        data: { university_id_image: resp.url },
    });

    return { url: resp.url, teamMember: updated };
};
