import prisma from "../prisma";

interface Profile {
  id?: number;
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
  endPeriod: Date;
}

function compare_edu_exp(obj1: EducationExperience, obj2: EducationExperience) {
  return (
    obj1.title === obj2.title ||
    obj1.description === obj2.description ||
    obj1.organization === obj2.organization
  );
}

function raw_to_profile(obj: any): Profile | null {
  if (!obj) {
    return null;
  }
  return {
    id: obj.id,
    firstName: obj.user?.firstName,
    lastName: obj.user?.lastName,
    skills: obj.skills.split(","),
    education: obj.education,
    experience: obj.experience,
    totalCoins: obj.user?.totalCoins,
    pfp: obj.pfp,
  };
}

async function getProfiles() {
  const profiles = await prisma.profile.findMany({
    include: {
      education: true,
      experience: true,
      user: { select: { firstName: true, lastName: true, totalCoins: true } },
    },
  });

  return profiles.map(raw_to_profile);
}

async function getProfile(id: number) {
  const profile = await prisma.profile.findUnique({
    include: {
      education: true,
      experience: true,
      user: { select: { firstName: true, lastName: true, totalCoins: true } },
    },
    where: { id },
  });

  return raw_to_profile(profile);
}

async function addProfile(id: number, profile: Profile) {
  if (typeof profile.skills === "string") {
    throw new Error(
      "internal validation error: profile.skills was string instead of string[]",
    );
  }
  if (!(await prisma.user.findUnique({ where: { id } }))) {
    return null;
  }

  const new_profile = await prisma.profile.create({
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

  return raw_to_profile(new_profile);
}

async function changeProfile(id: number, profile: Profile) {
  if (typeof profile.skills === "string") {
    throw new Error(
      "internal validation error: profile.skills was string instead of string[]",
    );
  }

  if (!(await prisma.profile.findUnique({ where: { id } }))) {
    return null;
  }

  const transactions = [];

  if (prisma.education) {
    transactions.push(
      prisma.education.deleteMany({
        where: {
          id: {
            in: (await prisma.education.findMany({ where: { profileId: id } }))
              .filter((old_el) =>
                profile.education.every(
                  (new_el) => !compare_edu_exp(old_el, new_el),
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
              .filter((old_el) =>
                profile.experience.every(
                  (new_el) => !compare_edu_exp(old_el, new_el),
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
  const new_profile = await prisma.profile.update({
    data: {
      skills: profile.skills ? profile.skills.join(",") : undefined,
    },
    where: { id },
    include: { education: true, experience: true },
  });
  const new_user = await prisma.user.update({
    data: {
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
    where: { id },
    select: { firstName: true, lastName: true, totalCoins: true },
  });
  return raw_to_profile({ ...new_profile, ...new_user });
}

async function removeProfile(id: number) {
  if (!(await prisma.profile.findUnique({ where: { id } }))) {
    return null;
  }

  await prisma.education.deleteMany({ where: { profileId: id } });
  await prisma.experience.deleteMany({ where: { profileId: id } });
  await prisma.profile.delete({ where: { id } });
}

export { getProfiles, getProfile, addProfile, changeProfile, removeProfile };
