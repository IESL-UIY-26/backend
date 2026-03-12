import { prisma } from '../../config/db';

export const getUniversities = async () => {
  return prisma.university.findMany({ orderBy: { name: 'asc' } });
};

export const createUniversity = async (name: string) => {
  return prisma.university.create({ data: { name } });
};

export const updateUniversity = async (id: string, name: string) => {
  return prisma.university.update({ where: { id }, data: { name } });
};

export const deleteUniversity = async (id: string) => {
  return prisma.university.delete({ where: { id } });
};
