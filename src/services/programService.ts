import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";

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
  coins: true,
  _count: {
    select: {
      UserProgram: { where: { applied: { not: null } } },
    },
  },
});

// prisma.program
//   .findMany({
//     select: {
//       id: true,
//       title: true,
//       description: true,
//       founder: true,
//       durationInDays: true,
//       applicationDeadline: true,
//       _count: {
//         select: {
//           UserProgram: { where: { applied: { not: null } } },
//         },
//       },
//     },
//   })
//   .then((res) => console.log(res));
//
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
};
