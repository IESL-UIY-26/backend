import { z } from 'zod';

export const RegisterSchema = z.object({
  full_name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  contact_number: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;