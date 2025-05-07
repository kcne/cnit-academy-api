import { Request, Response } from "express";
import {
  repositoryService,
  publishBlog,
  getBlogsByUserId,
  getBlogBySlug,
  getAllComments,
  createComment,
  deleteComment,
} from "../services/blogService";
import { z } from "zod";
import { AuthenticatedRequest, Role } from "../middlewares/authMiddleware";

async function getBlogs(req: Request, res: Response) {
  const { page, limit } = req.query;

  const blogs = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
    filters: [
      {
        field: "published",
        value: true,
        operator: "equals",
      },
    ],
  });
  res.json(blogs);
}

async function getBlog(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const blog = await repositoryService.findItem(id);
  res.json(blog);
}

async function createBlog(req: AuthenticatedRequest, res: Response) {
  const blog = await repositoryService.createItem({
    ...req.body,
    userId: req.user?.id,
  });
  res.status(201).json(blog);
}

async function updateBlog(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const blog = await repositoryService.updateItem(
    id,
    req.body,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );
  res.json(blog);
}

async function deleteBlog(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(
    id,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );
  res.send();
}

async function togglePublishBlog(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await publishBlog(
    id,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );
  res.send();
}

async function handleGetBlogsByUserId(req: Request, res: Response) {
  const userId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.userId);
  const blogs = await getBlogsByUserId(userId);
  res.json(blogs);
}

async function handleGetBlogBySlug(req: Request, res: Response) {
  const { slug } = req.params;
  const blog = await getBlogBySlug(slug);
  res.json(blog);
}

async function getComments(req: Request, res: Response) {
  const { page, limit } = req.query;

  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const comments = await getAllComments(id, {
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });

  res.json(comments);
}

async function postComment(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  await createComment(req.body, id, userId);

  res.send();
}

async function deleteCommentById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const commentId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.commentId);

  await deleteComment(id, commentId);

  res.send();
}

export {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
  handleGetBlogsByUserId,
  handleGetBlogBySlug,
  getComments,
  postComment,
  deleteCommentById,
};
