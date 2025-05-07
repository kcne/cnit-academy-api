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
  slug: z
    .string()
    .min(1)
    .max(256)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)"
    ),
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

async function getBlogsByUserId(userId: number) {
  const blogs = await repositoryService.getAll({
    pagination: {
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
    },
    filters: [
      {
        field: "userId",
        value: userId,
        operator: "equals",
      },
    ],
  });
  return blogs;
}

async function getBlogBySlug(slug: string) {
  const blog = await prisma.blog.findUnique({
    where: { slug },
  });
  if (!blog) {
    throw createHttpError(404, "Blog not found");
  }
  return blog;
}

async function updateBlogById(
  id: number,
  updatedBlog: Partial<z.infer<typeof BlogSchema>>
) {
  const blog = await prisma.blog.update({
    where: { id },
    data: updatedBlog,
  });
  if (!blog) {
    throw createHttpError(404, "Blog not found");
  }
  return blog;
}

export {
  repositoryService,
  validateCreateBlog,
  validateUpdateBlog,
  publishBlog,
  getBlogsByUserId,
  getBlogBySlug,
  updateBlogById,
};
