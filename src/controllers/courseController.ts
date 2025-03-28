import { Request, Response } from "express";
import CourseService from "../services/courseService";

const courseService = new CourseService();

export const getAllCourses = async (req: Request, res: Response) => {
  const courses = await courseService.getAllCourses();
  res.json(courses);
};

export const getCourseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const course = await courseService.getCourseById(id);
  if (!course) {
    res.status(404).json({ message: "Course not found" });
  } else {
    res.json(course);
  }
};

export const deleteCourseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await courseService.deleteCourseById(id);
  res.json({ message: "Course deleted successfully" });
};

export const updateCourseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const course = req.body;
  const updatedCourse = await courseService.updateCourseById(id, course);
  res.json(updatedCourse);
};

export const createCourse = async (req: Request, res: Response) => {
  const course = req.body;
  const createdCourse = await courseService.createCourse(course);
  res.json(createdCourse);
};
