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

async function beginLesson(userId: number, lectureId: number) {
  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  if (!lecture) {
    throw createHttpError(404, "Lecture not found");
  }

  await prisma.userLecture.create({
    data: {
      userId,
      lectureId,
    },
  });
}

async function completeLesson(userId: number, lectureId: number) {
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    select: { coins: true },
  });
  if (!lecture) {
    throw createHttpError(404, "Lecture not found");
  }

  // TODO: this can probably be a single call
  const userLecture = await prisma.userLecture.findFirst({
    where: { userId, lectureId },
    select: {
      id: true,
      finished: true,
    },
  });
  await prisma.userLecture.upsert({
    create: {
      userId,
      lectureId,
      finished: new Date(),
    },
    update: {
      finished: new Date(),
    },
    where: {
      id: userLecture?.id || -1,
    },
  });

  if (!userLecture?.finished) {
    const userQuizAttempt = await prisma.userQuizAttempt.findFirst({
      where: { userId, quizId: lectureId },
      select: {
        score: true,
      },
      orderBy: {
        id: "asc", // count only the first attempt
      },
    });
    if (!userQuizAttempt) {
      if (await prisma.quiz.findUnique({ where: { id: lectureId } })) {
        throw createHttpError(400, "This lecture has an unfinished quiz");
      }
    }
    await prisma.user.update({
      data: {
        totalCoins: {
          increment: Math.ceil(lecture.coins * (userQuizAttempt?.score ?? 1)),
        },
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
  beginLesson,
  completeLesson,
  customFindItem,
  LectureSchema,
};
