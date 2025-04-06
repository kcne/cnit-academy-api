import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";

const CourseSchema = z.object({
  title: z.string().max(256),
  description: z.string().max(1024),
  founder: z.string().max(256),
  durationInDays: z.number().int().min(1).max(1000),
  applicationDeadline: z.coerce.date().min(new Date()),
});
const validateCreateCourse = validateRequest(CourseSchema);
const validateUpdateCourse = validateRequest(CourseSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.course, {
  id: true,
  title: true,
  description: true,
  numberOfStudents: true,
  durationInHours: true,
  Lecture: {
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      courseId: true,
    },
  },
});

export { repositoryService, validateCreateCourse, validateUpdateCourse };
