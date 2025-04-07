import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";

const LectureSchema = z.object({
  title: z.string().max(256),
  content: z.string().max(65535),
  videoUrl: z.string().max(1024),
  lectureId: z.number().int().positive(),
});
const validateCreateLecture = validateRequest(LectureSchema);
const validateUpdateLecture = validateRequest(LectureSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.lecture);

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
  const id =
    (await prisma.userLecture.findFirst({ where: { userId, lectureId } }))
      ?.id || -1;
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
      id,
    },
  });
}

export {
  repositoryService,
  validateCreateLecture,
  validateUpdateLecture,
  changeStatus,
};
