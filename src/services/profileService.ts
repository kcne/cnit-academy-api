import prisma from "../prisma";

interface Profile {
  id?: number;
  name: string;
  surname: string;
  skills: string[] | string;
  education: EducationExperience[];
  experience: EducationExperience[];
}

interface EducationExperience {
  title: string;
  description: string;
  organization: string;
  startPeriod: Date;
  endPeriod: Date;
}

function raw_to_profile(obj: any): Profile | null {
  if (!obj) {
    return null;
  }
  return {
    ...obj,
    skills: obj.skills.split(","),
    education: obj.education.map((el: EducationExperience) => ({
      title: el.title,
      description: el.description,
      organization: el.organization,
      startPeriod: el.startPeriod,
      endPeriod: el.endPeriod,
    })),
    experience: obj.experience.map((el: EducationExperience) => ({
      title: el.title,
      description: el.description,
      organization: el.organization,
      startPeriod: el.startPeriod,
      endPeriod: el.endPeriod,
    })),
  };
}

async function getProfiles() {
  const profiles = await prisma.profile.findMany({
    include: { education: true, experience: true },
  });

  return profiles.map(raw_to_profile);
}

async function getProfile(id: number) {
  const profile = await prisma.profile.findUnique({
    include: { education: true, experience: true },
    where: { id },
  });

  return raw_to_profile(profile);
}

async function addProfile(profile: Profile) {
  if (typeof profile.skills === "string") {
    throw new Error(
      "internal validation error: profile.skills was string instead of string[]",
    );
  }
  const new_profile = await prisma.profile.create({
    data: {
      ...profile,
      skills: profile.skills.join(","),
      education: { create: profile.education },
      experience: { create: profile.experience },
    },
    include: { education: true, experience: true },
  });

  return raw_to_profile(new_profile);
}

async function changeProfile(id: number, profile: Profile) {
  if (typeof profile.skills === "string") {
    throw new Error(
      "internal validation error: profile.skills was string instead of string[]",
    );
  }

  await prisma.education.deleteMany({ where: { profileId: id } });
  await prisma.education.createMany({
    data: profile.education.map((el) => ({ ...el, profileId: id })),
  });
  await prisma.experience.deleteMany({ where: { profileId: id } });
  await prisma.experience.createMany({
    data: profile.experience.map((el) => ({ ...el, profileId: id })),
  });
  const new_profile = await prisma.profile.update({
    data: {
      name: profile.name,
      surname: profile.surname,
      skills: profile.skills.join(","),
    },
    where: { id },
    include: { education: true, experience: true },
  });

  return raw_to_profile(new_profile);
}

async function removeProfile(id: number) {
  await prisma.education.deleteMany({ where: { profileId: id } });
  await prisma.experience.deleteMany({ where: { profileId: id } });
  await prisma.profile.delete({ where: { id } });
}

export { getProfiles, getProfile, addProfile, changeProfile, removeProfile };
