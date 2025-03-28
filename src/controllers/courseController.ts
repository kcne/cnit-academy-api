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
  const id = Number(req.params.id);
  const course = await findItem(id);
  if (!course) {
    res.status(404).json({ message: "Course not found" });
  } else {
    res.json(course);
  }
}

async function deleteCourseById(req: Request, res: Response) {
  const id = Number(req.params.id);
  await deleteItem(id);
  res.json({ message: "Course deleted successfully" });
}

async function updateCourseById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const course = req.body;
  const updatedCourse = await updateItem(id, course);
  res.json(updatedCourse);
}

async function createCourse(req: Request, res: Response) {
  const course = req.body;
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
