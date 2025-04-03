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
  startPeriod: z.date().max(new Date()),
  endPeriod: z.date().max(new Date()),
});

const UpdateProfileSchema = z.object({
  id: z.number().positive().int(),
  firstName: z.string().min(2).max(256),
  lastName: z.string().min(2).max(256),
  skills: z.array(z.string().max(64)),
  education: z.array(EducationExperienceSchema),
  experience: z.array(EducationExperienceSchema),
  totalCoins: z.number().positive().int(),
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
}

interface EducationExperience {
  id?: number;
  title: string;
  description: string;
  organization: string;
  startPeriod: Date;
  endPeriod: Date; // TODO: jobs don't need an end date
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
          isEmailVerified: true,
        },
      },
    },
    where: { id },
  });

  if (!profile) {
    throw createHttpError(404, "Profile not found");
  }

  return rawToProfile(profile);
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
      user: { select: { firstName: true, lastName: true, totalCoins: true } },
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

  if (prisma.education) {
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
  if (prisma.experience) {
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
