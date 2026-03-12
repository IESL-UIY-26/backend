import { prisma } from '../../config/db';

export const getSessions = async () => {
  return prisma.session.findMany({ orderBy: { session_date: 'asc' } });
};

export const createSession = async (data: {
  title: string;
  description?: string;
  zoom_link?: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  host_name?: string;
  created_by: string;
}) => {
  return prisma.session.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      zoom_link: data.zoom_link ?? null,
      session_date: new Date(data.session_date),
      session_time: new Date(`1970-01-01T${data.session_time}:00`),
      duration_minutes: data.duration_minutes,
      host_name: data.host_name ?? null,
      created_by: data.created_by,
    },
  });
};

export const updateSession = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    zoom_link?: string;
    session_date?: string;
    session_time?: string;
    duration_minutes?: number;
    host_name?: string;
  }
) => {
  return prisma.session.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.zoom_link !== undefined && { zoom_link: data.zoom_link }),
      ...(data.session_date !== undefined && { session_date: new Date(data.session_date) }),
      ...(data.session_time !== undefined && { session_time: new Date(`1970-01-01T${data.session_time}:00`) }),
      ...(data.duration_minutes !== undefined && { duration_minutes: data.duration_minutes }),
      ...(data.host_name !== undefined && { host_name: data.host_name }),
    },
  });
};

export const deleteSession = async (id: string) => {
  return prisma.session.delete({ where: { id } });
};
