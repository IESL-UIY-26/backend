import { prisma } from '../../config/db';
import type { UpdateMyProfileDto } from './user.model';

export const searchUsersByEmail = async (email: string) => {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: email,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      teamMembers: {
        select: { id: true },
        take: 1,
      },
    },
    take: 10,
    orderBy: { email: 'asc' },
  });

  return users.map(({ teamMembers, ...user }) => ({
    ...user,
    in_team: teamMembers.length > 0,
  }));
};

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      full_name: true,
      email: true,
      contact_number: true,
      role: true,
      gender: true,
      address: true,
      date_of_birth: true,
      account_status: true,
      created_at: true,
    },
  });

  if (!user) {
    const err = new Error('User not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return user;
};

export const updateMyProfile = async (userId: string, data: UpdateMyProfileDto) => {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) {
    const err = new Error('User not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.full_name !== undefined && { full_name: data.full_name }),
      ...(data.contact_number !== undefined && { contact_number: data.contact_number }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.date_of_birth !== undefined && {
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      }),
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      contact_number: true,
      role: true,
      gender: true,
      address: true,
      date_of_birth: true,
      account_status: true,
      created_at: true,
    },
  });
};
