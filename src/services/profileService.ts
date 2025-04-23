import createHttpError from "http-errors";
import prisma from "../prisma";
import { z } from "zod";
import { validateRequest } from "../middlewares/validate";
import {
  createPaginatedResponse,
  PaginationOptions,
} from "../utils/queryBuilder";

const EducationExperienceSchema = z.object({
  id: z.number().positive().int().optional(),
  title: z.string().min(2).max(256),
  description: z.string().min(2).max(1024),
  organization: z.string().min(2).max(256),
  startPeriod: z.coerce.date().max(new Date()),
  endPeriod: z.coerce.date().max(new Date()).optional(),
});

const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(256).optional(),
  lastName: z.string().min(2).max(256).optional(),
  skills: z.array(z.string().max(64)).optional(),
  education: z.array(EducationExperienceSchema).optional(),
  experience: z.array(EducationExperienceSchema).optional(),
  totalCoins: z.number().positive().int().optional(),
  pfp: z
    .string()
    .max(64)
    .refine(
      (str) => str.match(/^(\/pfp\/\d+\.)(png|webp|jpg)$/),
      "Pfp string is invalid",
    )
    .optional(),
});

const CreateProfileSchema = z.object({
  skills: z.array(z.string().max(64)),
  education: z.array(EducationExperienceSchema),
  experience: z.array(EducationExperienceSchema),
  pfp: z
    .string()
    .max(64)
    .refine(
      (str) => str.match(/^(\/pfp\/\d+\.)(png|webp|jpg)$/),
      "Pfp string is invalid",
    )
    .optional(),
});

const validateCreateProfile = validateRequest(CreateProfileSchema);
const validateUpdateProfile = validateRequest(UpdateProfileSchema);

interface Profile {
  id?: number;
  email: string;
  isEmailVerified?: string;
  firstName?: string;
  lastName?: string;
  skills: string[] | string;
  education: EducationExperience[];
  experience: EducationExperience[];
  totalCoins?: number;
  pfp?: string;
  badges: any[];
  streak: number;
}

interface EducationExperience {
  id?: number;
  title: string;
  description: string;
  organization: string;
  startPeriod: Date;
  endPeriod: Date | null;
}

function compareEduExp(obj1: EducationExperience, obj2: EducationExperience) {
  return (
    obj1.title === obj2.title ||
    obj1.description === obj2.description ||
    obj1.organization === obj2.organization
  );
}

function rawToProfile(obj: any): Profile | null {
  if (!obj) {
    return null;
  }
  return {
    id: obj.id,
    email: obj.user?.email,
    isEmailVerified: obj.user?.isEmailVerified,
    firstName: obj.user?.firstName,
    lastName: obj.user?.lastName,
    skills: obj.skills.split(",").filter((el: any) => el),
    education: obj.education,
    experience: obj.experience,
    totalCoins: obj.user?.totalCoins,
    pfp: obj.pfp,
    badges: obj.user?.badges,
    streak: obj.user?.UserActivity?.streak ?? 0,
  };
}

async function getProfiles(pagination: PaginationOptions) {
  const { page, limit } = pagination;
  const profiles = await prisma.profile.findMany({
    take: limit,
    skip: page * limit - limit,
    include: {
      education: true,
      experience: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          totalCoins: true,
          email: true,
          createdAt: true,
          badges: {
            select: {
              title: true,
              icon: true,
            },
          },
          UserActivity: {
            select: {
              streak: true,
            },
          },
        },
      },
    },
  });
  const total = await prisma.profile.count();

  return createPaginatedResponse(profiles.map(rawToProfile), total, pagination);
}

async function getProfile(id: number) {
  const profile = await prisma.profile.findUnique({
    include: {
      education: true,
      experience: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          totalCoins: true,
          email: true,
          createdAt: true,
          isEmailVerified: true,
          badges: {
            select: {
              title: true,
              icon: true,
            },
          },
          UserActivity: {
            select: {
              streak: true,
            },
          },
          UserProgram: {
            where: {
              userId: id,
            },
            select: {
              applied: true,
              enrolled: true,
              finished: true,
              program: true,
            },
          },
          UserCourse: {
            where: {
              userId: id,
            },
            select: {
              finished: true,
              course: true,
            },
          },
          UserLecture: {
            where: {
              userId: id,
            },
            select: {
              finished: true,
              lecture: true,
            },
          },
        },
      },
    },
    where: { id },
  });

  if (!profile) {
    throw createHttpError(404, "Profile not found");
  }

  return {
    ...rawToProfile(profile),
    programs: profile.user.UserProgram.map((el) => ({
      ...el.program,
      applied: el.applied ?? false,
      enrolled: el.enrolled ?? false,
      finished: el.finished ?? false,
    })),
    courses: profile.user.UserCourse.map((el) => ({
      ...el.course,
      finished: el.finished ?? false,
    })),
    lectures: profile.user.UserLecture.map((el) => ({
      ...el.lecture,
      finished: el.finished ?? false,
    })),
  };
}

async function addProfile(id: number, profile: Profile) {
  if (typeof profile.skills === "string") {
    throw new Error(
      "internal validation error: profile.skills was string instead of string[]",
    );
  }
  if (!(await prisma.user.findUnique({ where: { id } }))) {
    throw createHttpError(404, "User not found");
  }

  const newProfile = await prisma.profile.create({
    data: {
      pfp: profile.pfp,
      skills: profile.skills.join(","),
      education: { create: profile.education },
      experience: { create: profile.experience },
      id,
    },
    include: {
      education: true,
      experience: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          totalCoins: true,
          createdAt: true,
          badges: {
            select: {
              title: true,
              icon: true,
            },
          },
          UserActivity: {
            select: {
              streak: true,
            },
          },
        },
      },
    },
  });

  return rawToProfile(newProfile);
}

async function changeProfile(id: number, profile: Profile) {
  if (typeof profile.skills === "string") {
    throw new Error(
      "internal validation error: profile.skills was string instead of string[]",
    );
  }

  if (!(await prisma.user.findUnique({ where: { id } }))) {
    throw createHttpError(404, "User not found");
  }

  const transactions = [];

  if (profile.education) {
    transactions.push(
      prisma.education.deleteMany({
        where: {
          id: {
            in: (await prisma.education.findMany({ where: { profileId: id } }))
              .filter((oldEl) =>
                profile.education.every(
                  (newEl) => !compareEduExp(oldEl, newEl),
                ),
              )
              .map((el) => el.id),
          },
        },
      }),
    );
    profile.education.forEach((education) => {
      transactions.push(
        prisma.education.upsert({
          create: { ...education, profileId: id },
          update: education,
          where: {
            id: education.id || -1,
          },
        }),
      );
    });
  }
  if (profile.experience) {
    transactions.push(
      prisma.experience.deleteMany({
        where: {
          id: {
            in: (await prisma.experience.findMany({ where: { profileId: id } }))
              .filter((oldEl) =>
                profile.experience.every(
                  (newEl) => !compareEduExp(oldEl, newEl),
                ),
              )
              .map((el) => el.id),
          },
        },
      }),
    );
    profile.experience.forEach((experience) => {
      transactions.push(
        prisma.experience.upsert({
          create: { ...experience, profileId: id },
          update: experience,
          where: {
            id: experience.id || -1,
          },
        }),
      );
    });
  }

  await prisma.$transaction(transactions);
  const newProfile = await prisma.profile.update({
    data: {
      skills: profile.skills ? profile.skills.join(",") : undefined,
    },
    where: { id },
    include: { education: true, experience: true },
  });
  const newUser = await prisma.user.update({
    data: {
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
    where: { id },
    select: {
      firstName: true,
      lastName: true,
      totalCoins: true,
      email: true,
      isEmailVerified: true,
      createdAt: true,
      badges: {
        select: {
          title: true,
          icon: true,
        },
      },
      UserActivity: {
        select: {
          streak: true,
        },
      },
    },
  });
  return rawToProfile({ ...newProfile, user: newUser });
}

async function removeProfile(id: number) {
  if (!(await prisma.profile.findUnique({ where: { id } }))) {
    throw createHttpError(404, "User not found");
  }

  await prisma.education.deleteMany({ where: { profileId: id } });
  await prisma.experience.deleteMany({ where: { profileId: id } });
  await prisma.profile.delete({ where: { id } });
  await prisma.user.delete({ where: { id } });
}

export {
  getProfiles,
  getProfile,
  addProfile,
  changeProfile,
  removeProfile,
  validateCreateProfile,
  validateUpdateProfile,
};
