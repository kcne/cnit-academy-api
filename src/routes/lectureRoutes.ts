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

const router = Router();

router.get("/", asyncHandler(getAllLectures));
router.get("/:id", asyncHandler(getLectureById));
router.put("/:id/start", asyncHandler(startLecture));
router.put("/:id/finish", asyncHandler(finishLecture));

// admin routes
router.post("/admin", validateCreateLecture, asyncHandler(createLecture));
router.patch(
  "/admin/:id",
  validateUpdateLecture,
  asyncHandler(updateLectureById),
);
router.delete("/admin/:id", asyncHandler(deleteLectureById));

export default router;
