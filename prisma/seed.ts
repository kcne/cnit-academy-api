import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  const users = [
    { firstName: "Marko", lastName: "Marković", email: "marko@gmail.com" },
    { firstName: "Jovana", lastName: "Jovanović", email: "jovana@gmail.com" },
    { firstName: "Nikola", lastName: "Nikolić", email: "nikola@gmail.com" },
    { firstName: "Ana", lastName: "Anić", email: "ana@gmail.com" },
    { firstName: "Petar", lastName: "Petrović", email: "petar@gmail.com" },
    { firstName: "Ivana", lastName: "Ivić", email: "ivana@gmail.com" },
    { firstName: "Stefan", lastName: "Stefanović", email: "stefan@gmail.com" },
    { firstName: "Maja", lastName: "Majić", email: "maja@gmail.com" },
    { firstName: "Luka", lastName: "Lukić", email: "luka@gmail.com" },
    { firstName: "Jelena", lastName: "Jelendić", email: "jelena@gmail.com" },
    { firstName: "Sanja", lastName: "Sanjković", email: "sanja@gmail.com" },
    { firstName: "Vladimir", lastName: "Vuković", email: "vladimir@gmail.com" },
    { firstName: "Tamara", lastName: "Todorović", email: "tamara@gmail.com" },
    { firstName: "Bojan", lastName: "Bojković", email: "bojan@gmail.com" },
    { firstName: "Marija", lastName: "Marić", email: "marija@gmail.com" },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        totalCoins: 100,
        roles: {
          connect: [{ id: userRole.id }],
        },
        Profile: {
          create: {
            name: userData.firstName,
            surname: userData.lastName,
            skills: "JavaScript, TypeScript, React",
            education: {
              create: {
                title: "Software Engineering",
                description: "Bachelor's degree in Software Engineering",
                organization: "State University of Novi Pazar",
                startPeriod: new Date("2020-09-01"),
                endPeriod: new Date("2024-06-30"),
              },
            },
            experience: {
              create: {
                title: "Frontend Developer",
                description: "Worked on various frontend projects",
                organization: "Tech Company",
                startPeriod: new Date("2023-01-01"),
                endPeriod: new Date("2024-03-01"),
              },
            },
          },
        },
      },
    });
  }

  console.log("Seeding completed with 15 users!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
