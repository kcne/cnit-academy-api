import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";

const LectureSchema = z.object({
  title: z.string().max(256),
  content: z.string().max(65535),
  videoUrl: z.string().max(1024),
  courseId: z.number().int().positive(),
});
const validateCreateLecture = validateRequest(LectureSchema);
const validateUpdateLecture = validateRequest(LectureSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.lecture);

export { repositoryService, validateCreateLecture, validateUpdateLecture };
