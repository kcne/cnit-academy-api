import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import prisma from "../prisma";

const ONE_DAY = 24 * 60 * 60 * 1000;

export default async function (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id = req.user.id;

  const lastActivity = await prisma.userActivity.findUnique({
    where: {
      id,
    },
  });

  if (!lastActivity) {
    await prisma.userActivity.create({
      data: { id, streak: 0 },
    });
    next();
    return;
  }

  const midnight = new Date().setHours(0, 0, 0, 0);
  const lastLogin = lastActivity.loginAt.getMilliseconds();

  if (lastLogin > midnight) {
    next();
    return;
  }

  if (lastLogin > midnight - ONE_DAY) {
    await prisma.userActivity.update({
      where: { id },
      data: { streak: { increment: 1 } },
    });
    next();
    return;
  }

  await prisma.userActivity.update({
    where: { id },
    data: { streak: 0 },
  });
  next();
}
