import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";

const { getAll, findItem, createItem, updateItem, deleteItem } =
  new PrismaRepositoryService(prisma, prisma.course);

export { getAll, findItem, createItem, updateItem, deleteItem };

