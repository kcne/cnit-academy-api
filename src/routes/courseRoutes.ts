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
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllCourses));
router.get("/:id", asyncHandler(getCourseById));
router.put("/:id/start", asyncHandler(startCourse));
router.put("/:id/finish", asyncHandler(finishCourse));

// admin routes
router.post(
  "/admin",
  authMiddleware(["INSTRUCTOR"]),
  validateCreateCourse,
  asyncHandler(createCourse),
);
router.patch(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  validateUpdateCourse,
  asyncHandler(updateCourseById),
);
router.delete(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  asyncHandler(deleteCourseById),
);

export default router;
