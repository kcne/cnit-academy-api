import { Request, Response } from "express";
import {
  changeStatus,
  customFindItem,
  repositoryService,
  updateCourse,
} from "../services/courseService";
import { z } from "zod";
import { AuthenticatedRequest, Role } from "../middlewares/authMiddleware";
import assert from "assert";

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
  res.json({
    data: data.map((old: any) => renameFields(old)),
    meta,
  });
}

async function getMyCourses(req: AuthenticatedRequest, res: Response) {
  const { page, limit } = req.query;
  assert(req.user);
  const userId = req.user.id;

  const courses = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
    filters: [
      {
        field: "UserCourse",
        value: { some: { userId } },
        operator: "equals",
      },
    ],
  });

  res.json({
    data: courses.data.map((old: any) => renameFields(old)),
    meta: courses.meta,
  });
}

async function getCoursesByUserId(req: AuthenticatedRequest, res: Response) {
  const { page, limit } = req.query;
  assert(req.user);
  const userId =
    req.params.userId === "me"
      ? req.user.id
      : z.coerce.number().positive().int().parseAsync(req.params.userId);

  const courses = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
    filters: [
      {
        field: "userId",
        value: userId,
        operator: "equals",
      },
    ],
  });

  res.json({
    data: courses.data.map((old: any) => renameFields(old)),
    meta: courses.meta,
  });
}

async function getCourseById(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const userId = req.user.id;
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const course = await customFindItem(id, userId);

  res.json(renameFields(course));
}

async function createCourse(req: AuthenticatedRequest, res: Response) {
  const course = await repositoryService.createItem({
    ...req.body,
    lectures: {
      create: req.body.lectures.create.map((lecture: any) => ({
        ...lecture,
        userId: req.user?.id,
      })),
    },
    userId: req.user?.id,
  });

  res.status(201).json(renameFields(course));
}

async function updateCourseById(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const course = await updateCourse(
    id,
    req.body,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );

  res.json(course);
}

async function startCourse(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
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
  assert(req.user);
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
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
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
  getMyCourses,
  getCoursesByUserId,
};
