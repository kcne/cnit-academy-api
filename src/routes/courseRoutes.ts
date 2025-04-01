import { Router } from "express";
import {
  createCourse,
  deleteCourseById,
  getAllCourses,
  getCourseById,
  updateCourseById,
} from "../controllers/courseController";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getAllCourses));
router.get("/:id", asyncHandler(getCourseById));
router.post("/", asyncHandler(createCourse));
router.put("/:id", asyncHandler(updateCourseById));
router.delete("/:id", asyncHandler(deleteCourseById));

export default router;
