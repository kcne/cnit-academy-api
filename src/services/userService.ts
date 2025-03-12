import prisma from "../prisma";
import createHttpError from "http-errors";

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany();

    return users;
  } catch (error) {
    throw createHttpError(500, "Failed to fetch");
  }
};
