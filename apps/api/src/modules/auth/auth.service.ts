import { supabase } from '../../config/supabase';
import { prisma } from '../../config/db';

/**
 * Verifies the Supabase access token and upserts the user profile in Neon DB.
 * Works for both email/password and OAuth (Google) sign-ins.
 *
 * @param accessToken  The Supabase JWT from the Authorization header.
 * @param fullName     Optional display name supplied by the frontend (email sign-up).
 */
export const syncUser = async (
  accessToken: string,
  profile?: {
    full_name?: string;
    contact_number?: string;
    date_of_birth?: string;
    address?: string;
    gender?: string;
  }
) => {
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
    profile?.full_name ??
    (user_metadata['full_name'] as string | undefined) ??
    (user_metadata['name'] as string | undefined) ??
    '';

  // Upsert: create profile on first sync; update optional fields if provided (e.g. profile completion after Google OAuth).
  const user = await prisma.user.upsert({
    where: { id },
    update: {
      ...(profile?.full_name && { full_name: profile.full_name }),
      ...(profile?.contact_number && { contact_number: profile.contact_number }),
      ...(profile?.date_of_birth && { date_of_birth: new Date(profile.date_of_birth) }),
      ...(profile?.address && { address: profile.address }),
      ...(profile?.gender && { gender: profile.gender }),
    },
    create: {
      id,
      email,
      full_name: resolvedName,
      role: 'USER',
      account_status: 'PENDING',
      contact_number: profile?.contact_number ?? null,
      date_of_birth: profile?.date_of_birth ? new Date(profile.date_of_birth) : null,
      address: profile?.address ?? null,
      gender: profile?.gender ?? null,
    },
  });

  return user;
};
