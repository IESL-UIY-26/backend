import { z } from 'zod';

export const CreateUniversitySchema = z.object({ name: z.string().min(1) });
export const UpdateUniversitySchema = CreateUniversitySchema;

export type CreateUniversityDto = z.infer<typeof CreateUniversitySchema>;
export type UpdateUniversityDto = z.infer<typeof UpdateUniversitySchema>;
