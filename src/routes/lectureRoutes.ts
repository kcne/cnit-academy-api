import { Router } from "express";
import {
  createLecture,
  deleteLectureById,
  finishLecture,
  getAllLectures,
  getLectureById,
  getMyLectures,
  getLecturesByUserId,
  startLecture,
  updateLectureById,
} from "../controllers/lectureController";
import asyncHandler from "../middlewares/asyncHandler";
import {
  validateCreateLecture,
  validateUpdateLecture,
} from "../services/lectureService";
import authMiddleware, { Role } from "../middlewares/authMiddleware";
import streakMiddleware from "../middlewares/streakMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllLectures));
router.get("/my", asyncHandler(getMyLectures));
router.get("/userId/:userId", asyncHandler(getLecturesByUserId));
router.get("/:id", asyncHandler(getLectureById));
router.put("/:id/start", asyncHandler(startLecture));
router.put("/:id/finish", streakMiddleware, asyncHandler(finishLecture));

// admin routes
router.post(
  "/admin",
  authMiddleware([Role.instructor]),
  validateCreateLecture,
  asyncHandler(createLecture),
);
router.patch(
  "/admin/:id",
  authMiddleware([Role.instructor]),
  validateUpdateLecture,
  asyncHandler(updateLectureById),
);
router.delete(
  "/admin/:id",
  authMiddleware([Role.instructor]),
  asyncHandler(deleteLectureById),
);

export default router;
