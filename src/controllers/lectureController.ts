import { Request, Response } from "express";
import {
  completeLesson,
  repositoryService,
  beginLesson,
} from "../services/lectureService";
import { z } from "zod";
import { AuthenticatedRequest, Role } from "../middlewares/authMiddleware";
import assert from "assert";

async function getAllLectures(req: Request, res: Response) {
  const { page, limit } = req.query;

  const lectures = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });
  res.json(lectures);
}

async function getMyLectures(req: AuthenticatedRequest, res: Response) {
  const { page, limit } = req.query;
  assert(req.user);
  const userId = req.user.id;

  const lectures = repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
    filters: [
      {
        field: "UserLecture",
        value: { some: { userId } },
        operator: "equals",
      },
    ],
  });

  res.json(lectures);
}

async function getLectureById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const lecture = await repositoryService.findItem(id);

  res.json(lecture);
}

async function createLecture(req: AuthenticatedRequest, res: Response) {
  const lecture = await repositoryService.createItem({
    ...req.body,
    userId: req.user?.id,
  });

  res.status(201).json(lecture);
}

async function updateLectureById(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const lecture = await repositoryService.updateItem(
    id,
    req.body,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );

  res.json(lecture);
}

async function startLecture(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const userId = req.user.id;
  const lectureId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await beginLesson(userId, lectureId);

  res.send();
}

async function finishLecture(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const userId = req.user.id;
  const lectureId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await completeLesson(userId, lectureId);

  res.send();
}

async function deleteLectureById(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(
    id,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );

  res.send();
}

export {
  getAllLectures,
  getLectureById,
  deleteLectureById,
  updateLectureById,
  createLecture,
  startLecture,
  finishLecture,
  getMyLectures,
};
