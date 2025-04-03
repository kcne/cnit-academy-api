import { Router } from "express";
import {
  createCourse,
  deleteCourseById,
  getAllCourses,
  getCourseById,
  updateCourseById,
} from "../controllers/courseController";
import asyncHandler from "../middlewares/asyncHandler";
import {
  validateCreateCourse,
  validateUpdateCourse,
} from "../services/courseService";

const router = Router();

router.get("/", asyncHandler(getAllCourses));
router.get("/:id", asyncHandler(getCourseById));
router.post("/", validateCreateCourse, asyncHandler(createCourse));
router.patch("/:id", validateUpdateCourse, asyncHandler(updateCourseById));
router.delete("/:id", asyncHandler(deleteCourseById));

export default router;
