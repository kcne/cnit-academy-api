import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";
import { LectureSchema } from "./lectureService";

const CreateCourseSchema = z
  .object({
    title: z.string().max(256),
    description: z.string().max(1024),
    durationInHours: z.number().max(1000),
    coins: z.number().int().positive().optional(),
    lectures: z.array(LectureSchema.omit({ courseId: true })),
  })
  .transform((course) => ({
    ...course,
    lectures: { create: course.lectures },
  }));
const UpdateCourseSchema = z
  .object({
    title: z.string().max(256),
    description: z.string().max(1024),
    durationInHours: z.number().max(1000),
    coins: z.number().int().positive().optional(),
    lectures: z.object({
      create: z.array(LectureSchema.omit({ courseId: true })),
      update: z.array(
        LectureSchema.omit({ courseId: true }).extend({
          id: z.number().int().positive(),
        }),
      ),
      delete: z.array(z.number().int().positive()),
    }),
  })
  .partial();
const validateCreateCourse = validateRequest(CreateCourseSchema);
const validateUpdateCourse = validateRequest(UpdateCourseSchema);

const repositoryService = new PrismaRepositoryService(prisma.course, {
  id: true,
  title: true,
  description: true,
  durationInHours: true,
  createdAt: true,
  coins: true,
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  lectures: {
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      courseId: true,
      createdAt: true,
      coins: true,
    },
  },
  _count: {
    select: {
      UserCourse: { where: { finished: { not: null } } },
    },
  },
});

async function customFindItem(id: number, userId: number) {
  const course = await prisma.course.findUnique({
    select: {
      id: true,
      title: true,
      description: true,
      durationInHours: true,
      createdAt: true,
      coins: true,
      lectures: {
        select: {
          id: true,
          title: true,
          content: true,
          videoUrl: true,
          courseId: true,
          createdAt: true,
          coins: true,
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
      },
      UserCourse: {
        select: {
          finished: true,
        },
        where: {
          id,
          userId,
        },
      },
      _count: {
        select: {
          UserCourse: { where: { finished: { not: null } } },
        },
      },
    },
    where: {
      id,
    },
  });

  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  const res = {
    ...course,
    lectures: course.lectures.map((lecture) => {
      return {
        ...lecture,
        started: Boolean(lecture.UserLecture.length),
        finished: Boolean(lecture.UserLecture[0]?.finished),
        UserLecture: undefined,
      };
    }),
    started: Boolean(course.UserCourse.length),
    finished: Boolean(course.UserCourse[0]?.finished),
    UserCourse: undefined,
  };

  return res;
}

async function changeStatus(
  userId: number,
  courseId: number,
  finished: boolean,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  // TODO: this can probably be a single call
  const userCourse = await prisma.userCourse.findFirst({
    where: { userId, courseId },
  });
  await prisma.userCourse.upsert({
    create: {
      userId,
      courseId,
      finished: finished ? new Date() : undefined,
    },
    update: {
      finished: finished ? new Date() : undefined,
    },
    where: {
      id: userCourse?.id || -1,
    },
  });

  if (finished && !userCourse?.finished) {
    await prisma.user.update({
      data: {
        totalCoins: { increment: course.coins },
      },
      where: {
        id: userId,
      },
    });
  }
}

async function updateCourse(
  id: number,
  data: z.infer<typeof UpdateCourseSchema>,
  maybeUserId?: number,
) {
  const course = await prisma.course.findUnique({
    where: { id, userId: maybeUserId },
  });
  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  const userId = maybeUserId ?? course.userId;

  const transactions = [];

  transactions.push(
    prisma.course.update({
      where: { id },
      data: {
        ...data,
        lectures: {
          create: data.lectures?.create.map((lecture) => ({
            ...lecture,
            userId,
          })),
        },
      },
    }),
  );

  if (data.lectures?.update) {
    for (const lecture of data.lectures.update) {
      try {
        transactions.push(
          prisma.lecture.update({
            where: { id: lecture.id, courseId: course.id },
            data: lecture,
          }),
        );
      } catch (err) {
        throw createHttpError(
          404,
          "Lecture with id " + lecture.id + " not found",
        );
      }
    }
  }
  if (data.lectures?.delete) {
    transactions.push(
      prisma.lecture.deleteMany({
        where: { id: { in: data.lectures.delete }, courseId: course.id },
      }),
    );
  }

  await prisma.$transaction(transactions);

  return await prisma.course.findUnique({
    where: { id },
    include: { lectures: true },
  });
}

export {
  repositoryService,
  validateCreateCourse,
  validateUpdateCourse,
  changeStatus,
  customFindItem,
  updateCourse,
};
