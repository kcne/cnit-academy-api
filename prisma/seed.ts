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

async function seedLanguages() {
  const existing = await prisma.language.findMany();
  if (existing.length === 0) {
    await prisma.language.createMany({
      data: [
        { languageCode: "sr", language: "Srpski" },
        { languageCode: "en", language: "English" },
      ],
    });
    console.log("Default languages created.");
  } else {
    console.log("Languages already exist. Skipping.");
  }
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
    languageCode: faker.helpers.arrayElement(["sr", "en"]), // povezujemo s postojećim jezicima
  };
}

function createNewCourse() {
  return {
    title: faker.hacker.noun(),
    description: faker.hacker.phrase(),
    durationInHours: faker.number.float({ min: 0, max: 10 }),
  };
}

function createNewProgram() {
  return {
    title: faker.book.title(),
    description: faker.hacker.phrase(),
    durationInDays: faker.number.int({ min: 2, max: 365 }),
    applicationDeadline: faker.date.soon({ days: 30 }),
  };
}

function createNewLecture() {
  return {
    title: faker.book.title(),
    content: faker.hacker.phrase(),
    videoUrl: faker.internet.url(),
  };
}

async function main() {
  if (process.env.SEED) {
    faker.seed(Number(process.env.SEED));
  }

  // Seed jezika
  await seedLanguages();

  const users = Number(process.env.USERS || 15);
  const courses = Number(process.env.COURSES || 10);
  const programs = Number(process.env.PROGRAMS || 5);
  const lectures = Number(process.env.LECTURES || 3);

  const transactions: any[] = [];

  for (let i = 0; i < users; i++) {
    const user = await createNewUser();
    await prisma.user.create({
      data: { ...user, role: "USER" },
    });
  }

  for (let i = 0; i < courses; i++) {
    const course = createNewCourse();
    const id = (
      await prisma.course.create({
        data: { ...course, createdBy: { connect: { id: 1 } } },
      })
    ).id;
    // TODO: FIX THIS
    // for (let j = 0; j < lectures; j++) {
    //   const lecture = createNewLecture();
    //   transactions.push(
    //     prisma.lecture.create({
    //       data: { ...lecture, courseId: id, createdBy: undefined },
    //     }),
    //   );
    // }
  }

  for (let i = 0; i < programs; i++) {
    const program = createNewProgram();
    transactions.push(
      prisma.program.create({
        data: { ...program, createdBy: { connect: { id: 1 } } },
      }),
    );
  }

  await prisma.$transaction(transactions);

  console.log(`Seeding completed with:
  - ${users} users
  - ${courses} courses
  - ${programs} programs
  - ${lectures * courses} lectures`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
