import { supabase } from '../../config/supabase';
import { prisma } from '../../config/db';

/**
 * Verifies the Supabase access token and upserts the user profile in Neon DB.
 * Works for both email/password and OAuth (Google) sign-ins.
 *
 * @param accessToken  The Supabase JWT from the Authorization header.
 * @param fullName     Optional display name supplied by the frontend (email sign-up).
 */
export const syncUser = async (accessToken: string, fullName?: string) => {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error('Invalid or expired access token.');
  }

  const { id, email, user_metadata } = data.user;

  if (!email) {
    throw new Error('No email associated with this account.');
  }

  // Resolve display name: caller-supplied > OAuth metadata > empty string
  const resolvedName =
    fullName ??
    (user_metadata['full_name'] as string | undefined) ??
    (user_metadata['name'] as string | undefined) ??
    '';

  // Upsert: create profile on first sync, otherwise leave existing data intact.
  const user = await prisma.user.upsert({
    where: { id },
    update: {},
    create: {
      id,
      email,
      full_name: resolvedName,
      role: 'USER',
      account_status: 'PENDING',
    },
  });

  return user;
};
