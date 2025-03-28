import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import argon2 from "argon2";

const prisma = new PrismaClient();

interface EducationExperience {
  id?: number;
  title: string;
  description: string;
  organization: string;
  startPeriod: Date;
  endPeriod: Date;
}

async function createNewUser() {
  const skills: string[] = [];
  for (let i = 0; i < faker.number.int({ min: 0, max: 5 }); i++) {
    skills.push(faker.hacker.noun());
  }

  const education: EducationExperience[] = [];
  for (let i = 0; i < faker.number.int({ min: 0, max: 2 }); i++) {
    education.push({
      title: faker.person.jobTitle(),
      description: faker.company.catchPhrase(),
      organization: faker.company.name(),
      startPeriod: faker.date.past({ years: 20 }),
      endPeriod: faker.date.past({ years: 2 }),
    });
  }
  const experience: EducationExperience[] = [];
  for (let i = 0; i < faker.number.int({ min: 0, max: 4 }); i++) {
    experience.push({
      title: faker.person.jobTitle(),
      description: faker.company.catchPhrase(),
      organization: faker.company.name(),
      startPeriod: faker.date.past({ years: 20 }),
      endPeriod: faker.date.past({ years: 2 }),
    });
  }

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: await argon2.hash(faker.internet.password()),
    isEmailVerified: true,
    verificationCode: null,
    expiresAt: null,
    Profile: {
      create: {
        skills: skills.join(","),
        pfp: "/pfp/default",
        education: {
          create: education,
        },
        experience: {
          create: experience,
        },
      },
    },
    totalCoins: faker.number.int({ min: 0, max: 9999 }),
  };
}

async function main() {
  if (process.env.SEED) {
    faker.seed(Number(process.env.SEED));
  }
  const users = Number(process.env.USERS || 15);

  const transactions: any[] = [];

  for (let i = 0; i < users; i++) {
    const user = await createNewUser();
    transactions.push(
      prisma.user.create({
        data: user,
      }),
    );
  }

  await prisma.$transaction(transactions);

  console.log("Seeding completed with " + users + " users!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
