import { z } from 'zod';

export const UpdateMyProfileSchema = z.object({
	full_name: z.string().min(1).max(150).optional(),
	contact_number: z.string().max(255).optional().nullable(),
	date_of_birth: z.string().optional().nullable(),
	gender: z.string().optional().nullable(),
	address: z.string().optional().nullable(),
});

export type UpdateMyProfileDto = z.infer<typeof UpdateMyProfileSchema>;
