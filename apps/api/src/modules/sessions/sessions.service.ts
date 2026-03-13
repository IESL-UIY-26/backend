import { prisma } from '../../config/db';

export const getSessions = async () => {
  return prisma.session.findMany({ orderBy: { session_date: 'asc' } });
};

export const getAvailableSessions = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.session.findMany({
    where: {
      session_date: {
        gte: today,
      },
    },
    orderBy: [{ session_date: 'asc' }, { session_time: 'asc' }],
  });
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

// ─── Session Registration ─────────────────────────────────────────────────────

export const registerForSession = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    const err = new Error('Session not found');
    (err as any).statusCode = 404;
    throw err;
  }

  const existing = await prisma.sessionRegistration.findUnique({
    where: { session_id_user_id: { session_id: sessionId, user_id: userId } },
  });
  if (existing) {
    const err = new Error('Already registered for this session');
    (err as any).statusCode = 409;
    throw err;
  }

  return prisma.sessionRegistration.create({
    data: { session_id: sessionId, user_id: userId },
  });
};

export const unregisterFromSession = async (sessionId: string, userId: string) => {
  const existing = await prisma.sessionRegistration.findUnique({
    where: { session_id_user_id: { session_id: sessionId, user_id: userId } },
  });
  if (!existing) {
    const err = new Error('Registration not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return prisma.sessionRegistration.delete({
    where: { session_id_user_id: { session_id: sessionId, user_id: userId } },
  });
};

export const getMyRegistrations = async (userId: string) => {
  return prisma.sessionRegistration.findMany({
    where: { user_id: userId },
    include: { session: true },
    orderBy: { created_at: 'desc' },
  });
};

export const getMyRegistrationStatus = async (sessionId: string, userId: string) => {
  const registration = await prisma.sessionRegistration.findUnique({
    where: { session_id_user_id: { session_id: sessionId, user_id: userId } },
  });
  return { registered: !!registration, registration: registration ?? null };
};

export const getSessionParticipants = async (sessionId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    const err = new Error('Session not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return prisma.sessionRegistration.findMany({
    where: { session_id: sessionId },
    include: {
      user: { select: { id: true, full_name: true, email: true } },
    },
    orderBy: { created_at: 'asc' },
  });
};
