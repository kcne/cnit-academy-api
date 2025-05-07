import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";
import { createPaginatedResponse, QueryOptions } from "../utils/queryBuilder";

const programSchema = z.object({
  title: z.string(),
  description: z.string(),
  founder: z.string(),
  durationInDays: z.number(),
  applicationDeadline: z.coerce.date(),
  coins: z.number().int().positive().optional(),
});

const validateCreateProgram = validateRequest(programSchema);
const validateUpdateProgram = validateRequest(programSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.program, {
  id: true,
  title: true,
  description: true,
  founder: true,
  durationInDays: true,
  applicationDeadline: true,
  createdAt: true,
  coins: true,
  _count: {
    select: {
      UserProgram: { where: { applied: { not: null } } },
    },
  },
});

async function customGetAll(opts: QueryOptions<string>) {
  const { pagination } = opts;

  const programs = await prisma.program.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      durationInDays: true,
      applicationDeadline: true,
      coins: true,
    },
    orderBy: {
      id: "asc",
    },
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  });
  const total = await prisma.program.count();
  const counts = await prisma.userProgram.groupBy({
    by: "programId",
    _count: {
      applied: true,
      enrolled: true,
      finished: true,
    },
    orderBy: {
      programId: "asc",
    },
  });

  let i = 0;
  let j = 0;
  const res = [];
  // O(N)
  while (i < programs.length && j < counts.length) {
    // this clause is impossible (?) to be true
    if (programs[i].id > counts[j].programId) {
      j++;
      continue;
    } else if (programs[i].id < counts[j].programId) {
      i++;
      res.push({
        ...programs[i],
        appliedCount: 0,
        enrolledCount: 0,
        finishedCount: 0,
      });
      continue;
    }

    res.push({
      ...programs[i],
      ...counts[j]._count,
      appliedCount: counts[j]._count.applied,
      enrolledCount: counts[j]._count.enrolled,
      finishedCount: counts[j]._count.finished,
    });
    i++;
    j++;
  }
  if (!res.length) {
    for (const program of programs) {
      res.push({
        ...program,
        appliedCount: 0,
        enrolledCount: 0,
        finishedCount: 0,
      });
    }
  }

  return createPaginatedResponse(res, total, opts.pagination);
}

async function customFindItem(id: number, userId: number) {
  const program = await prisma.program.findUnique({
    select: {
      id: true,
      title: true,
      description: true,
      durationInDays: true,
      applicationDeadline: true,
      coins: true,
      UserProgram: {
        where: {
          id,
          userId,
        },
        select: {
          applied: true,
          enrolled: true,
          finished: true,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!program) {
    throw createHttpError(404, "Program not found");
  }

  const counts = await prisma.userProgram.groupBy({
    by: "programId",
    _count: {
      applied: true,
      enrolled: true,
      finished: true,
    },
    where: {
      programId: id,
    },
  });

  const res = {
    ...program,
    appliedCount: counts[0]?._count.applied || 0,
    enrolledCount: counts[0]?._count.enrolled || 0,
    finishedCount: counts[0]?._count.finished || 0,
    applied: Boolean(program.UserProgram[0]?.applied),
    enrolled: Boolean(program.UserProgram[0]?.enrolled),
    finished: Boolean(program.UserProgram[0]?.finished),
    UserProgram: undefined,
  };

  return res;
}

async function apply(userId: number, programId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  if (!program) {
    throw createHttpError(404, "Program not found");
  }

  // TODO: this can probably be a single call
  const userProgram = await prisma.userProgram.findFirst({
    where: { userId, programId },
  });
  await prisma.userProgram.upsert({
    create: {
      userId,
      programId,
      applied: new Date(),
    },
    update: {
      applied: new Date(),
    },
    where: {
      id: userProgram?.id || -1,
    },
  });
}

async function enrollApplicantsInProgram(
  userIds: number[],
  programId: number,
  userId?: number,
) {
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) {
    throw createHttpError(404, "Program not found");
  }
  if (userId ? userId !== program.userId : false) {
    throw createHttpError(403, "Only admins can edit foreign programs");
  }

  await prisma.userProgram.updateMany({
    where: {
      programId,
      applied: { not: null },
      userId: { in: userIds },
    },
    data: {
      enrolled: new Date(),
    },
  });
}

async function markProgramAsCompleted(programId: number, userId?: number) {
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) {
    throw createHttpError(404, "Program not found");
  }
  if (userId ? userId !== program.userId : false) {
    throw createHttpError(403, "Only admins can edit foreign programs");
  }

  const now = new Date();

  const [
    {
      program: { coins },
    },
  ] = await prisma.userProgram.updateManyAndReturn({
    where: {
      programId,
      enrolled: { not: null },
      finished: null,
    },
    data: {
      finished: now,
    },
    select: {
      program: {
        select: {
          coins: true,
        },
      },
    },
  });

  await prisma.user.updateMany({
    where: {
      UserProgram: {
        some: {
          finished: now,
        },
      },
    },
    data: {
      totalCoins: { increment: coins },
    },
  });
}

export {
  repositoryService,
  validateCreateProgram,
  validateUpdateProgram,
  apply,
  enrollApplicantsInProgram,
  markProgramAsCompleted,
  customGetAll,
  customFindItem,
};
