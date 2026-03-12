import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Max 255 characters'),
  description: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  youtube_link: z.string().url('Invalid YouTube URL').optional(),
  pdf: z.string().url('Invalid PDF URL').optional(),
  github_url: z.string().url('Invalid GitHub URL').optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
