import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuiz,
  submitQuiz,
  updateQuiz,
} from "../controllers/quizController";
import {
  validateCreateQuiz,
  validateSubmitQuiz,
  validateUpdateQuiz,
} from "../services/quizService";

const router = Router();

router.get("/", asyncHandler(getAllQuizzes));
router.get("/:id", asyncHandler(getQuiz));
router.put("/:id/submit", validateSubmitQuiz, asyncHandler(submitQuiz));

// admin routes
router.post(
  "/admin",
  authMiddleware(["INSTRUCTOR"]),
  validateCreateQuiz,
  asyncHandler(createQuiz),
);
router.patch(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  validateUpdateQuiz,
  asyncHandler(updateQuiz),
);
router.delete(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  asyncHandler(deleteQuiz),
);

export default router;
