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

function createNewCourse() {
  return {
    title: faker.hacker.noun(),
    description: faker.hacker.phrase(),
    durationInHours: faker.number.float({ min: 0, max: 10 }),
    numberOfStudents: faker.number.int({ min: 0, max: 120 }),
  };
}

function createNewProgram() {
  return {
    title: faker.book.title(),
    description: faker.hacker.phrase(),
    founder: faker.person.fullName(),
    durationInDays: faker.number.int({ min: 2, max: 365 }),
    applicationDeadline: faker.date.soon({ days: 30 }),
  };
}

async function main() {
  if (process.env.SEED) {
    faker.seed(Number(process.env.SEED));
  }
  const users = Number(process.env.USERS || 15);
  const courses = Number(process.env.COURSES || 10);
  const programs = Number(process.env.PROGRAMS || 5);

  const transactions: any[] = [];

  for (let i = 0; i < users; i++) {
    const user = await createNewUser();
    transactions.push(
      prisma.user.create({
        data: user,
      }),
    );
  }
  for (let i = 0; i < courses; i++) {
    const course = createNewCourse();
    transactions.push(
      prisma.course.create({
        data: course,
      }),
    );
  }
  for (let i = 0; i < programs; i++) {
    const program = createNewProgram();
    transactions.push(
      prisma.program.create({
        data: program,
      }),
    );
  }

  await prisma.$transaction(transactions);

  console.log("Seeding completed with " + users + " users!");
  console.log("Seeding completed with " + courses + " courses!");
  console.log("Seeding completed with " + programs + " programs!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
