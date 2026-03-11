import { supabase, supabaseAdmin } from '../../config/supabase';
import { prisma } from '../../config/db';
import type { RegisterDto, LoginDto } from './auth.model';

export const register = async (dto: RegisterDto) => {
  // 1. Create user in Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: dto.email,
    password: dto.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Failed to create auth user');
  }

  // 2. Store profile in our DB using the Supabase-issued UUID
  const user = await prisma.user.create({
    data: {
      id: data.user.id,
      full_name: dto.full_name,
      email: dto.email,
      contact_number: dto.contact_number ?? null,
      gender: dto.gender ?? null,
      address: dto.address ?? null,
      date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
      role: 'USER',
      account_status: 'PENDING',
    },
  });

  return user;
};

export const login = async (dto: LoginDto) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: dto.email,
    password: dto.password,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? 'Invalid credentials');
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
};
