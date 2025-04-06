import { Request, Response } from "express";
import { repositoryService } from "../services/lectureService";
import { z } from "zod";

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

async function getLectureById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const lecture = await repositoryService.findItem(id);

  res.json(lecture);
}

async function createLecture(req: Request, res: Response) {
  const lecture = await repositoryService.createItem(req.body);

  res.status(201).json(lecture);
}

async function updateLectureById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const lecture = await repositoryService.updateItem(id, req.body);

  res.json(lecture);
}

async function deleteLectureById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(id);

  res.send();
}

export {
  getAllLectures,
  getLectureById,
  deleteLectureById,
  updateLectureById,
  createLecture,
};
