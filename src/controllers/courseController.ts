import { Request, Response } from "express";
import { changeStatus, repositoryService } from "../services/courseService";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

function renameFields(input: any) {
  return { ...input, _count: undefined, studentCount: input._count.UserCourse };
}

async function getAllCourses(req: Request, res: Response) {
  const { page, limit } = req.query;

  const courses = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });

  const { data, meta } = courses;
  return res.json({
    data: data.map((old: any) => renameFields(old)),
    meta,
  });
}

async function getCourseById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const course = await repositoryService.findItem(id);

  res.json(renameFields(course));
}

async function createCourse(req: Request, res: Response) {
  const course = await repositoryService.createItem(req.body);

  res.status(201).json(renameFields(course));
}

async function updateCourseById(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const course = await repositoryService.updateItem(
    id,
    req.body,
    req.user?.role === "ADMIN" ? (req.user?.id ?? -1) : undefined,
  );

  res.json(renameFields(course));
}

async function startCourse(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;
  const courseId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await changeStatus(userId, courseId, false);

  res.send();
}

async function finishCourse(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;
  const courseId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await changeStatus(userId, courseId, true);

  res.send();
}

async function deleteCourseById(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(
    id,
    req.user?.role === "ADMIN" ? (req.user?.id ?? -1) : undefined,
  );

  res.send();
}

export {
  getAllCourses,
  getCourseById,
  deleteCourseById,
  updateCourseById,
  createCourse,
  startCourse,
  finishCourse,
};
