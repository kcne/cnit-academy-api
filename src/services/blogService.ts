import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";

const BlogSchema = z.object({
  userId: z.number().int().positive(),
  title: z.string().max(256),
  blogDescription: z.string().max(1024).optional(),
  content: z.string().max(65535),
  published: z.coerce.boolean().optional(),
});

const validateCreateBlog = validateRequest(BlogSchema);
const validateUpdateBlog = validateRequest(BlogSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.blog);

async function publishBlog(id: number) {
  const blog = await prisma.blog.update({
    where: { id },
    data: { published: true },
  });
  if (!blog) {
    throw createHttpError(404, "Blog not found");
  }
}

export {
  repositoryService,
  validateCreateBlog,
  validateUpdateBlog,
  publishBlog,
};
