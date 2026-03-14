import { prisma } from '../../config/db';

export const searchSessionsByDate = async (date: string, page = 1, limit = 10) => {
  const day = new Date(date);
  if (Number.isNaN(day.getTime())) {
    const err = new Error('Invalid date format. Use YYYY-MM-DD.');
    (err as any).statusCode = 400;
    throw err;
  }

  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  const where = {
    session_date: { gte: start, lte: end },
  };

  const skip = (page - 1) * limit;

  const [sessions, total] = await prisma.$transaction([
    prisma.session.findMany({
      where,
      orderBy: [{ session_time: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.session.count({ where }),
  ]);

  return {
    sessions,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};

export const getSessions = async () => {
  return prisma.session.findMany({ orderBy: { session_date: 'asc' } });
};

export const getAvailableSessions = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [sessions, total] = await prisma.$transaction([
    prisma.session.findMany({
      orderBy: [{ session_date: 'desc' }, { session_time: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.session.count(),
  ]);

  return {
    sessions,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
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

  try {
    const [registration] = await prisma.$transaction([
      prisma.sessionRegistration.create({
        data: { session_id: sessionId, user_id: userId },
      }),
      prisma.session.update({
        where: { id: sessionId },
        data: {
          count: {
            increment: 1,
          },
        },
      }),
    ]);

    return registration;
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const err = new Error('Already registered for this session');
      (err as any).statusCode = 409;
      throw err;
    }
    throw error;
  }
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

  const [registration] = await prisma.$transaction([
    prisma.sessionRegistration.delete({
      where: { session_id_user_id: { session_id: sessionId, user_id: userId } },
    }),
    prisma.session.update({
      where: { id: sessionId },
      data: {
        count: {
          decrement: 1,
        },
      },
    }),
  ]);

  return registration;
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

// ─── Session Feedback ─────────────────────────────────────────────────────────

export const createSessionFeedback = async (
  sessionId: string,
  userId: string,
  data: { rating: number; comment?: string }
) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    const err = new Error('Session not found');
    (err as any).statusCode = 404;
    throw err;
  }

  const existing = await prisma.sessionFeedback.findFirst({
    where: { session_id: sessionId, user_id: userId },
    select: { id: true },
  });

  if (existing) {
    const err = new Error('Feedback already exists for this session. Please edit your existing feedback.');
    (err as any).statusCode = 409;
    throw err;
  }

  return prisma.sessionFeedback.create({
    data: {
      session_id: sessionId,
      user_id: userId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });
};

export const updateMySessionFeedback = async (
  sessionId: string,
  userId: string,
  data: { rating?: number; comment?: string }
) => {
  const feedback = await prisma.sessionFeedback.findFirst({
    where: { session_id: sessionId, user_id: userId },
    select: { id: true },
  });

  if (!feedback) {
    const othersFeedback = await prisma.sessionFeedback.findFirst({
      where: {
        session_id: sessionId,
        user_id: { not: userId },
      },
      select: { id: true },
    });

    if (othersFeedback) {
      const err = new Error('Forbidden: You can only edit your own feedback');
      (err as any).statusCode = 403;
      throw err;
    }

    const err = new Error('Feedback not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return prisma.sessionFeedback.update({
    where: { id: feedback.id },
    data: {
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.comment !== undefined && { comment: data.comment || null }),
    },
  });
};

export const deleteMySessionFeedback = async (sessionId: string, userId: string) => {
  const feedback = await prisma.sessionFeedback.findFirst({
    where: { session_id: sessionId, user_id: userId },
    select: { id: true },
  });

  if (!feedback) {
    const othersFeedback = await prisma.sessionFeedback.findFirst({
      where: {
        session_id: sessionId,
        user_id: { not: userId },
      },
      select: { id: true },
    });

    if (othersFeedback) {
      const err = new Error('Forbidden: You can only delete your own feedback');
      (err as any).statusCode = 403;
      throw err;
    }

    const err = new Error('Feedback not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return prisma.sessionFeedback.delete({ where: { id: feedback.id } });
};

export const getSessionFeedbacksForAdmin = async (sessionId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    const err = new Error('Session not found');
    (err as any).statusCode = 404;
    throw err;
  }

  return prisma.sessionFeedback.findMany({
    where: { session_id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });
};

export const getMySessionFeedback = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    const err = new Error('Session not found');
    (err as any).statusCode = 404;
    throw err;
  }

  const feedback = await prisma.sessionFeedback.findFirst({
    where: { session_id: sessionId, user_id: userId },
  });

  return feedback;
};
