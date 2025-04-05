import { Request, Response } from "express";
import { repositoryService, publishBlog } from "../services/blogService";
import { z } from "zod";

async function getBlogs(req: Request, res: Response) {
  const { page, limit } = req.query;

  const blogs = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });
  res.json(blogs);
}

async function getBlog(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const blog = await repositoryService.findItem(id);
  res.json(blog);
}

async function createBlog(req: Request, res: Response) {
  const blog = await repositoryService.createItem(req.body);
  res.status(201).json(blog);
}

async function updateBlog(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const blog = await repositoryService.updateItem(id, req.body);
  res.json(blog);
}

async function deleteBlog(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(id);
  res.send();
}

async function togglePublishBlog(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await publishBlog(id);
  res.send();
}

export {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
};
