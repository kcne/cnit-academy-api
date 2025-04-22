import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import createHttpError from "http-errors";

const repositoryService = new PrismaRepositoryService(prisma.badge);

async function buy(id: number, userId: number) {
  const badge = await prisma.badge.findUnique({
    where: { id },
    select: { cost: true, Users: { where: { id: userId } } },
  });
  if (!badge) {
    throw createHttpError(404, "Badge not found");
  }
  if (badge.Users.length > 0) {
    throw createHttpError(409, "User has already bought this badge");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalCoins: { decrement: badge.cost },
      badges: { connect: { id } },
    },
  });
}

export { repositoryService, buy };
