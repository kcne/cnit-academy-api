import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";

const programSchema = z.object({
  title: z.string(),
  description: z.string(),
  founder: z.string(),
  durationInDays: z.number(),
  applicationDeadline: z.coerce.date(),
});

const {
  getAll,
  findItem,
  createItem: preCreateItem,
  updateItem: preUpdateItem,
  deleteItem,
} = new PrismaRepositoryService(prisma, prisma.program);

async function createItem(preData: z.infer<typeof programSchema>) {
  const data = programSchema.parseAsync(preData);
  return preCreateItem(data);
}
async function updateItem(id: number, preData: z.infer<typeof programSchema>) {
  const data = programSchema.partial().parseAsync(preData);
  return preUpdateItem(id, data);
}

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
};
