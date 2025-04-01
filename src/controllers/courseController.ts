import { Request, Response } from "express";
import {
  getAll,
  findItem,
  createItem,
  updateItem,
  deleteItem,
} from "../services/courseService";

async function getAllCourses(_req: Request, res: Response) {
  const courses = await getAll({
    pagination: { page: 1, limit: Number.MAX_SAFE_INTEGER }, // TODO: add pagination
  });
  res.json(courses.data);
}

async function getCourseById(req: Request, res: Response) {
  const id = Number(req.params.id); // TODO: add validation
  const course = await findItem(id);

  res.json(course);
}

async function deleteCourseById(req: Request, res: Response) {
  const id = Number(req.params.id); // TODO: add validation
  await deleteItem(id); // TODO: add validation

  res.send();
}

async function updateCourseById(req: Request, res: Response) {
  const id = Number(req.params.id); // TODO: add validation
  const course = req.body; // TODO: add validation
  const updatedCourse = await updateItem(id, course);

  res.json(updatedCourse);
}

async function createCourse(req: Request, res: Response) {
  const course = req.body; // TODO: add validation
  const createdCourse = await createItem(course);

  res.json(createdCourse);
}

export {
  getAllCourses,
  getCourseById,
  deleteCourseById,
  updateCourseById,
  createCourse,
};
