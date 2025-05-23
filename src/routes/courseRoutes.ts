import { Router } from "express";
import {
  createCourse,
  deleteCourseById,
  finishCourse,
  getAllCourses,
  getCourseById,
  getCoursesByUserId,
  getMyCourses,
  startCourse,
  updateCourseById,
} from "../controllers/courseController";
import asyncHandler from "../middlewares/asyncHandler";
import {
  validateCreateCourse,
  validateUpdateCourse,
} from "../services/courseService";
import authMiddleware, { Role } from "../middlewares/authMiddleware";
import streakMiddleware from "../middlewares/streakMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllCourses));
router.get("/my", asyncHandler(getMyCourses));
router.get("/userId/:userId", asyncHandler(getCoursesByUserId));
router.get("/:id", asyncHandler(getCourseById));
router.put("/:id/start", asyncHandler(startCourse));
router.put("/:id/finish", streakMiddleware, asyncHandler(finishCourse));

// admin routes
router.post(
  "/admin",
  authMiddleware([Role.instructor]),
  validateCreateCourse,
  asyncHandler(createCourse),
);
router.patch(
  "/admin/:id",
  authMiddleware([Role.instructor]),
  validateUpdateCourse,
  asyncHandler(updateCourseById),
);
router.delete(
  "/admin/:id",
  authMiddleware([Role.instructor]),
  asyncHandler(deleteCourseById),
);

export default router;
