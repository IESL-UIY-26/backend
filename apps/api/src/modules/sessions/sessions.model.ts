import { z } from 'zod';

export const CreateSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  zoom_link: z.string().url().optional().or(z.literal('')),
  session_date: z.string().min(1),
  session_time: z.string().min(1),
  duration_minutes: z.number().int().positive(),
  host_name: z.string().optional(),
});

export const UpdateSessionSchema = CreateSessionSchema.partial();

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
