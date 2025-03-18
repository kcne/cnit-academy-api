import express, { Router } from "express";
import CourseService from "../services/courseService";

const router: Router = express.Router();
const courseService = new CourseService();

router.get("/courses", async (req, res) => {
  const courses = await courseService.getAllCourses();
  res.json(courses);
});

router.get("/courses/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const course = await courseService.getCourseById(id);
  if (!course) {
    res.status(404).json({ message: "Course not found" });
  } else {
    res.json(course);
  }
});

router.delete("/courses/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await courseService.deleteCourseById(id);
  res.json({ message: "Course deleted successfully" });
});

router.put("/courses/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const course = req.body;
  const updatedCourse = await courseService.updateCourseById(id, course);
  res.json(updatedCourse);
});

router.post("/courses", async (req, res) => {
  const course = req.body;
  const createdCourse = await courseService.createCourse(course);
  res.json(createdCourse);
});

export default router;
