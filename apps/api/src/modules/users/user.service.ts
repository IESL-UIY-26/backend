import { prisma } from '../../config/db';

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
