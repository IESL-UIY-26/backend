import { z } from 'zod';

const SessionSchemaBase = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  zoom_link: z.string().url().optional().or(z.literal('')),
  session_date: z.string().min(1),
  session_time: z.string().min(1),
  duration_minutes: z.number().int().positive(),
  host_name: z.string().optional(),
});

export const CreateSessionSchema = SessionSchemaBase.refine(
  (data) => {
    const inputDate = new Date(data.session_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(inputDate.getTime()) && inputDate >= today;
  },
  {
    message: 'Session date cannot be in the past',
    path: ['session_date'],
  }
);

export const UpdateSessionSchema = SessionSchemaBase.partial().superRefine((data, ctx) => {
  if (!data.session_date) return;

  const inputDate = new Date(data.session_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(inputDate.getTime()) || inputDate < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['session_date'],
      message: 'Session date cannot be in the past',
    });
  }
});

export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
