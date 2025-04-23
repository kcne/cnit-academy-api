import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";

const LectureSchema = z.object({
  title: z.string().max(256),
  content: z.string().max(65535),
  videoUrl: z.string().max(1024).optional(),
  courseId: z.number().int().positive(),
  coins: z.number().int().positive().optional(),
});
const validateCreateLecture = validateRequest(LectureSchema);
const validateUpdateLecture = validateRequest(LectureSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.lecture);

async function customFindItem(id: number, userId: number) {
  const lecture = await prisma.lecture.findUnique({
    where: { id },
    include: {
      UserLecture: {
        where: {
          id,
          userId,
        },
        select: {
          finished: true,
        },
      },
    },
  });

  if (!lecture) {
    throw createHttpError(404, "Lecture not found");
  }

  const res = {
    ...lecture,
    started: Boolean(lecture.UserLecture.length),
    finished: Boolean(lecture.UserLecture[0]?.finished),
    UserLecture: undefined,
  };

  return res;
}

async function changeStatus(
  userId: number,
  lectureId: number,
  finished: boolean,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  if (!lecture) {
    throw createHttpError(404, "Lecture not found");
  }

  // TODO: this can probably be a single call
  const userLecture = await prisma.userLecture.findFirst({
    where: { userId, lectureId },
  });
  await prisma.userLecture.upsert({
    create: {
      userId,
      lectureId,
      finished: finished ? new Date() : undefined,
    },
    update: {
      finished: finished ? new Date() : undefined,
    },
    where: {
      id: userLecture?.id || -1,
    },
  });

  if (finished && !userLecture?.finished) {
    await prisma.user.update({
      data: {
        totalCoins: { increment: lecture.coins },
      },
      where: {
        id: userId,
      },
    });
  }
}

export {
  repositoryService,
  validateCreateLecture,
  validateUpdateLecture,
  changeStatus,
  customFindItem,
};
