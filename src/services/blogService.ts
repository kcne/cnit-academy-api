import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import { validateRequest } from "../middlewares/validate";
import createHttpError from "http-errors";
import { createPaginatedResponse, QueryOptions } from "../utils/queryBuilder";

const BlogSchema = z.object({
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
      "Slug must be URL-friendly (lowercase letters, numbers, and hyphens)",
    ),
});

const validateCreateBlog = validateRequest(BlogSchema);
const validateUpdateBlog = validateRequest(BlogSchema.partial());

const repositoryService = new PrismaRepositoryService(prisma.blog);

async function publishBlog(id: number, userId?: number) {
  const blog = await prisma.blog.update({
    where: { id },
    data: { published: true },
  });
  if (!blog) {
    throw createHttpError(404, "Blog not found");
  }
  if (userId && userId !== blog.userId) {
    throw createHttpError(403, "Only admins can edit foreign blogs");
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

const commentSchema = z.object({
  content: z.string().max(4096),
});

const validateCreateComment = validateRequest(commentSchema);

async function getAllComments(blogId: number, opts: QueryOptions<string>) {
  const blog = prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) {
    throw createHttpError(404, "Blog not found");
  }

  const comments = await prisma.commentBlog.findMany({
    where: { blogId },
    select: {
      comment: true,
    },
  });
  const total = await prisma.commentBlog.count({
    where: { blogId },
  });

  return createPaginatedResponse(
    comments.map((el) => el.comment),
    total,
    opts.pagination,
  );
}

async function createComment(commentData: any, blogId: number, userId: number) {
  const blog = prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) {
    throw createHttpError(404, "Blog not found");
  }

  const comment = await prisma.comment.create({
    data: { ...commentData, userId },
  });
  await prisma.commentBlog.create({
    data: {
      commentId: comment.id,
      blogId,
    },
  });
}

async function deleteComment(blogId: number, commentId: number) {
  await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.commentBlog.deleteMany({ where: { commentId, blogId } }),
  ]);
}

export {
  repositoryService,
  validateCreateBlog,
  validateUpdateBlog,
  validateCreateComment,
  publishBlog,
  getBlogsByUserId,
  getBlogBySlug,
  getAllComments,
  createComment,
  deleteComment,
};
