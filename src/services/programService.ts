import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";
import {
  createPaginatedResponse,
  PaginationOptions,
  QueryOptions,
} from "../utils/queryBuilder";

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
      founder: true,
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
        applied: 0,
        enrolled: 0,
        finished: 0,
      });
      continue;
    }

    res.push({
      ...programs[i],
      ...counts[j]._count,
    });
    i++;
    j++;
  }

  return createPaginatedResponse(res, total, opts.pagination);
}
async function customFindItem(id: number, userId: number) {
  const program = await prisma.program.findUnique({
    select: {
      id: true,
      title: true,
      description: true,
      founder: true,
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
    applied: program.UserProgram[0]?.applied ?? false,
    enrolled: program.UserProgram[0]?.enrolled ?? false,
    finished: program.UserProgram[0]?.finished ?? false,
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

async function enroll(userIds: number[], programId: number) {
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

async function finish(programId: number) {
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
  enroll,
  finish,
  customGetAll,
  customFindItem,
};
