import { prisma } from '../../config/db';

export const searchUsersByEmail = async (email: string) => {
  return prisma.user.findMany({
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
    },
    take: 10,
    orderBy: { email: 'asc' },
  });
};
