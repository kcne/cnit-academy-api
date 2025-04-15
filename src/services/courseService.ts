import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";

const CourseSchema = z.object({
  title: z.string().max(256),
  description: z.string().max(1024),
  founder: z.string().max(256),
  durationInDays: z.number().int().min(1).max(1000),
  applicationDeadline: z.coerce.date().min(new Date()),
  coins: z.number().int().positive().optional(),
});
const validateCreateCourse = validateRequest(CourseSchema);
const validateUpdateCourse = validateRequest(CourseSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.course, {
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
    },
  },
  _count: {
    select: {
      UserCourse: { where: { finished: { not: null } } },
    },
  },
});

async function customGetCourse(id: number, userId: number) {
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
              userId,
            },
            select: {
              finished: true,
            },
          },
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
    createHttpError(404, "Course not found");
  }

  const res = {
    ...course,
    lectures: course?.lectures.map((el) => {
      const started = Boolean(el.UserLecture.length);
      const finished = started ? Boolean(el.UserLecture[0].finished) : false;
      return { ...el, UserLecture: undefined, started, finished };
    }),
  };

  console.log(res);
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

// prisma.course
//   .findMany({
//     select: {
//       id: true,
//       title: true,
//       description: true,
//       durationInHours: true,
//       lectures: {
//         select: {
//           id: true,
//           title: true,
//           content: true,
//           videoUrl: true,
//           courseId: true,
//         },
//       },
//       _count: {
//         select: {
//           UserCourse: { where: { finished: { not: null } } },
//         },
//       },
//     },
//   })
//   .then((res) => console.log(res));

export {
  repositoryService,
  validateCreateCourse,
  validateUpdateCourse,
  changeStatus,
  customGetCourse,
};
