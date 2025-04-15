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
  createdAt: true,
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
async function changeStatus(
  userId: number,
  programId: number,
  applied: boolean,
  enrolled: boolean,
  finished: boolean,
) {
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
      applied: applied ? new Date() : undefined,
      enrolled: enrolled ? new Date() : undefined,
      finished: finished ? new Date() : undefined,
    },
    update: {
      applied: applied ? new Date() : undefined,
      enrolled: enrolled ? new Date() : undefined,
      finished: finished ? new Date() : undefined,
    },
    where: {
      id: userProgram?.id || -1,
    },
  });

  if (finished && !userProgram?.finished) {
    await prisma.user.update({
      data: {
        totalCoins: { increment: program.coins },
      },
      where: {
        id: userId,
      },
    });
  }
}

export {
  repositoryService,
  validateCreateProgram,
  validateUpdateProgram,
  changeStatus,
};
