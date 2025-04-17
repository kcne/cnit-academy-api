import { Router } from "express";
import {
  createLecture,
  deleteLectureById,
  finishLecture,
  getAllLectures,
  getLectureById,
  startLecture,
  updateLectureById,
} from "../controllers/lectureController";
import asyncHandler from "../middlewares/asyncHandler";
import {
  validateCreateLecture,
  validateUpdateLecture,
} from "../services/lectureService";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllLectures));
router.get("/:id", asyncHandler(getLectureById));
router.put("/:id/start", asyncHandler(startLecture));
router.put("/:id/finish", asyncHandler(finishLecture));

// admin routes
router.post(
  "/admin",
  authMiddleware("Admin"),
  validateCreateLecture,
  asyncHandler(createLecture),
);
router.patch(
  "/admin/:id",
  authMiddleware("Admin"),
  validateUpdateLecture,
  asyncHandler(updateLectureById),
);
router.delete(
  "/admin/:id",
  authMiddleware("Admin"),
  asyncHandler(deleteLectureById),
);

export default router;
