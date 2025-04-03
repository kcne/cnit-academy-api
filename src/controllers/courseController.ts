import { Request, Response } from "express";
import { repositoryService } from "../services/courseService";
import { z } from "zod";

async function getAllCourses(_req: Request, res: Response) {
  const courses = await repositoryService.getAll({
    pagination: { page: 1, limit: Number.MAX_SAFE_INTEGER }, // TODO: add pagination
  });
  res.json(courses.data);
}

async function getCourseById(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const course = await repositoryService.findItem(id);

  res.json(course);
}

async function deleteCourseById(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(id);

  res.send();
}

async function updateCourseById(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const course = req.body;
  const updatedCourse = await repositoryService.updateItem(id, course);

  res.json(updatedCourse);
}

async function createCourse(req: Request, res: Response) {
  const course = req.body;
  const createdCourse = await repositoryService.createItem(course);

  res.json(createdCourse);
}

export {
  getAllCourses,
  getCourseById,
  deleteCourseById,
  updateCourseById,
  createCourse,
};
