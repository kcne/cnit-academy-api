import { Router } from "express";
import {
  createLecture,
  deleteLectureById,
  getAllLectures,
  getLectureById,
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
router.post("/", validateCreateLecture, asyncHandler(createLecture));
router.patch("/:id", validateUpdateLecture, asyncHandler(updateLectureById));
router.delete("/:id", asyncHandler(deleteLectureById));

export default router;
