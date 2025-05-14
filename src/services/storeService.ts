import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import createHttpError from "http-errors";
import { validateRequest } from "../middlewares/validate";

const repositoryService = new PrismaRepositoryService(prisma.badge);

const badgeSchema = z.object({
  title: z.string().max(256),
  icon: z.string().max(256),
  cost: z.number().positive().int(),
});

const validateCreateBadge = validateRequest(badgeSchema);
const validateUpdateBadge = validateRequest(badgeSchema.optional());

async function buy(id: number, userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      totalCoins: true,
    },
  });
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
  if ((user?.totalCoins ?? -1) < badge.cost) {
    throw createHttpError(
      400,
      "User doesn't have enough coins for this purchase",
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalCoins: { decrement: badge.cost },
      badges: { connect: { id } },
    },
    select: { totalCoins: true },
  });
}

export { repositoryService, buy, validateCreateBadge, validateUpdateBadge };
