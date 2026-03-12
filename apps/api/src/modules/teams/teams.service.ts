import { prisma } from '../../config/db';
import type { CreateTeamDto, UpdateTeamDto } from './teams.model';

// Neon serverless can have cold-start latency; raise limits accordingly
const TX_OPTS = { maxWait: 10_000, timeout: 30_000 };

export const createTeam = async (data: CreateTeamDto) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create supervisor
    const supervisor = await tx.supervisor.create({
      data: {
        supervisor_name: data.supervisor.supervisor_name,
        supervisor_email: data.supervisor.supervisor_email,
        supervisor_contact_number: data.supervisor.supervisor_contact_number,
        supervisor_university_id: data.supervisor.supervisor_university_id,
      },
    });

    // 2. Create co-supervisor (optional)
    let coSupervisor = null;
    if (data.co_supervisor) {
      coSupervisor = await tx.supervisor.create({
        data: {
          supervisor_name: data.co_supervisor.supervisor_name,
          supervisor_email: data.co_supervisor.supervisor_email,
          supervisor_contact_number: data.co_supervisor.supervisor_contact_number,
          supervisor_university_id: data.co_supervisor.supervisor_university_id,
        },
      });
    }

    // 3. Create the team
    const team = await tx.team.create({
      data: {
        team_name: data.team_name,
        university_id: data.university_id,
        supervisor_id: supervisor.supervisor_id,
        co_supervisor_id: coSupervisor?.supervisor_id ?? null,
      },
    });

    // 4. Guard: reject any user_id already in a team
    const userIds = data.members
      .map((m) => m.user_id)
      .filter((id): id is string => id !== undefined);

    const alreadyMembers = await tx.teamMember.findMany({
      where: { user_id: { in: userIds } },
      select: {
        user_id: true,
        user: { select: { full_name: true, email: true } },
      },
    });

    if (alreadyMembers.length > 0) {
      const names = alreadyMembers
        .map((m) => `${m.user.full_name} (${m.user.email})`)
        .join(', ');
      const err = new Error(
        `The following users are already in a team: ${names}`
      ) as Error & { statusCode: number };
      err.statusCode = 409;
      throw err;
    }

    // 5. Create team members
    const members = await Promise.all(
      data.members.map((member) =>
        tx.teamMember.create({
          data: {
            user_id: member.user_id,
            iesl_id: member.iesl_id,
            team_id: team.id,
            role: member.role,
            department: member.department,
            university_id_image: member.university_id_image,
          },
        })
      )
    );

    return {
      ...team,
      supervisor,
      co_supervisor: coSupervisor,
      members,
    };
  }, TX_OPTS);
};

export const getMyTeam = async (userId: string) => {
  const membership = await prisma.teamMember.findFirst({
    where: { user_id: userId },
    include: {
      team: {
        include: {
          university: true,
          supervisor: true,
          coSupervisor: true,
          members: {
            include: { user: { select: { id: true, full_name: true, email: true } } },
            orderBy: { created_at: 'asc' },
          },
        },
      },
    },
  });
  return membership?.team ?? null;
};

export const getTeams = async () => {
  return prisma.team.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      university: true,
      supervisor: true,
      coSupervisor: true,
      members: {
        include: { user: { select: { id: true, full_name: true, email: true } } },
      },
    },
  });
};

export const getTeamById = async (id: string) => {
  return prisma.team.findUnique({
    where: { id },
    include: {
      university: true,
      supervisor: true,
      coSupervisor: true,
      members: {
        include: { user: { select: { id: true, full_name: true, email: true } } },
      },
    },
  });
};

export const isTeamLeader = async (userId: string, teamId: string) => {
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      user_id: userId,
      team_id: teamId,
      role: 'LEADER',
    },
  });
  return !!teamMember;
};

export const updateTeam = async (id: string, data: UpdateTeamDto) => {
  return prisma.$transaction(async (tx) => {
    // Fetch existing team to resolve supervisor/co-supervisor IDs
    const existing = await tx.team.findUnique({
      where: { id },
      select: { supervisor_id: true, co_supervisor_id: true },
    });
    if (!existing) throw new Error('Team not found');

    // 1. Update supervisor in-place if provided
    if (data.supervisor && existing.supervisor_id) {
      await tx.supervisor.update({
        where: { supervisor_id: existing.supervisor_id },
        data: data.supervisor,
      });
    }

    // 2. Handle co-supervisor
    let newCoSupervisorId: string | null | undefined = undefined; // undefined = no change
    if (data.co_supervisor === null) {
      // Explicitly remove co-supervisor
      newCoSupervisorId = null;
    } else if (data.co_supervisor !== undefined) {
      if (existing.co_supervisor_id) {
        // Update existing co-supervisor in-place
        await tx.supervisor.update({
          where: { supervisor_id: existing.co_supervisor_id },
          data: data.co_supervisor,
        });
      } else {
        // Create a new co-supervisor
        const created = await tx.supervisor.create({
          data: {
            supervisor_name: data.co_supervisor.supervisor_name ?? '',
            supervisor_email: data.co_supervisor.supervisor_email ?? '',
            supervisor_contact_number: data.co_supervisor.supervisor_contact_number ?? '',
            supervisor_university_id: data.co_supervisor.supervisor_university_id ?? '',
          },
        });
        newCoSupervisorId = created.supervisor_id;
      }
    }

    // 3. Update team scalar fields
    const team = await tx.team.update({
      where: { id },
      data: {
        ...(data.team_name !== undefined && { team_name: data.team_name }),
        ...(data.university_id !== undefined && { university_id: data.university_id }),
        ...(newCoSupervisorId !== undefined && { co_supervisor_id: newCoSupervisorId }),
      },
    });

    // 4. Replace members if provided
    let members;
    if (data.members !== undefined) {
      await tx.teamMember.deleteMany({ where: { team_id: id } });
      members = await Promise.all(
        data.members.map((member) =>
          tx.teamMember.create({
            data: {
              user_id: member.user_id,
              iesl_id: member.iesl_id ?? null,
              team_id: id,
              role: member.role,
              department: member.department ?? null,
              university_id_image: member.university_id_image ?? null,
            },
          })
        )
      );
    } else {
      members = await tx.teamMember.findMany({ where: { team_id: id } });
    }

    return { ...team, members };
  }, TX_OPTS);
};

export const deleteTeam = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    // Remove members first to satisfy FK constraints
    await tx.teamMember.deleteMany({ where: { team_id: id } });
    return tx.team.delete({ where: { id } });
  }, TX_OPTS);
};

export const updateTeamSupervisor = async (
  teamId: string,
  userId: string,
  data: { supervisor_id?: string | null; co_supervisor_id?: string | null }
) => {
  // Check if user is team leader
  const isLeader = await isTeamLeader(userId, teamId);
  if (!isLeader) {
    const err = new Error('Only team leader can change supervisor data') as Error & {
      statusCode: number;
    };
    err.statusCode = 403;
    throw err;
  }

  // Update team with new supervisor IDs
  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(data.supervisor_id !== undefined && { supervisor_id: data.supervisor_id }),
      ...(data.co_supervisor_id !== undefined && { co_supervisor_id: data.co_supervisor_id }),
    },
    include: {
      university: true,
      supervisor: true,
      coSupervisor: true,
      members: {
        include: { user: { select: { id: true, full_name: true, email: true } } },
      },
    },
  });

  return team;
};
