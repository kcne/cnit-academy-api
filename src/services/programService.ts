import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";

const programSchema = z.object({
  title: z.string(),
  description: z.string(),
  founder: z.string(),
  durationInDays: z.number(),
  applicationDeadline: z.coerce.date(),
});

const validateCreateProgram = validateRequest(programSchema);
const validateUpdateProgram = validateRequest(programSchema.partial());

const { getAll, findItem, createItem, updateItem, deleteItem } =
  new PrismaRepositoryService(prisma, prisma.program);

async function applyDeprecated(id: number): Promise<void> {
  await prisma.program.update({
    where: { id },
    data: {
      appliedCount: { increment: 1 },
    },
  });
}

async function enrollDeprecated(id: number): Promise<void> {
  await prisma.program.update({
    where: { id },
    data: {
      studentCount: { increment: 1 },
    },
  });
}

export {
  getAll,
  findItem,
  createItem,
  updateItem,
  deleteItem,
  applyDeprecated,
  enrollDeprecated,
  validateCreateProgram,
  validateUpdateProgram,
};
