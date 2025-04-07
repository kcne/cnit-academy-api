import { Router } from "express";
import {
  createCourse,
  deleteCourseById,
  finishCourse,
  getAllCourses,
  getCourseById,
  startCourse,
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
router.put("/:id/start", asyncHandler(startCourse));
router.put("/:id/finish", asyncHandler(finishCourse));
router.delete("/:id", asyncHandler(deleteCourseById));

export default router;
