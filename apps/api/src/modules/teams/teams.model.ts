import { z } from 'zod';

export const CreateSupervisorSchema = z.object({
  supervisor_name: z.string().min(1, 'Supervisor name is required'),
  supervisor_email: z.string().email('Invalid supervisor email'),
  supervisor_contact_number: z.string().min(1, 'Supervisor contact number is required'),
  supervisor_university_id: z.string().uuid('Invalid supervisor university ID'),
});

export const CreateTeamMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  iesl_id: z.number().int().positive('IESL ID must be a positive integer'),
  role: z.enum(['LEADER', 'MEMBER'], { message: 'Role must be LEADER or MEMBER' }),
  department: z.string().min(1, 'Department is required'),
  university_id_image: z.string().min(1, 'University ID image is required'),
});

export const CreateTeamSchema = z.object({
  team_name: z.string().min(1, 'Team name is required').max(150),
  university_id: z.string().uuid('Invalid university ID'),
  supervisor: CreateSupervisorSchema,
  co_supervisor: CreateSupervisorSchema.optional(),
  members: z
    .array(CreateTeamMemberSchema)
    .min(1, 'At least one team member is required'),
});

export const UpdateSupervisorSchema = CreateSupervisorSchema.partial();

export const UpdateTeamMemberSchema = CreateTeamMemberSchema.partial({
  iesl_id: true,
  department: true,
  university_id_image: true,
}).required({ user_id: true, role: true });

export const UpdateTeamSchema = z.object({
  team_name: z.string().min(1).max(150).optional(),
  university_id: z.string().uuid('Invalid university ID').optional(),
  supervisor: UpdateSupervisorSchema.optional(),
  // pass null explicitly to detach co-supervisor
  co_supervisor: UpdateSupervisorSchema.nullable().optional(),
  // when provided, fully replaces the existing member list
  members: z
    .array(UpdateTeamMemberSchema)
    .min(1, 'At least one team member is required')
    .optional(),
});

export type CreateTeamDto = z.infer<typeof CreateTeamSchema>;
export type CreateTeamMemberDto = z.infer<typeof CreateTeamMemberSchema>;
export type CreateSupervisorDto = z.infer<typeof CreateSupervisorSchema>;
export type UpdateTeamDto = z.infer<typeof UpdateTeamSchema>;
export type UpdateTeamMemberDto = z.infer<typeof UpdateTeamMemberSchema>;
