import { z } from 'zod';

export const VoteProjectParamsSchema = z.object({
  projectId: z.string().uuid(),
});

export type VoteProjectParamsDto = z.infer<typeof VoteProjectParamsSchema>;