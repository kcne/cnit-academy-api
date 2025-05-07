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
  authMiddleware("Admin"),
  validateCreateQuiz,
  asyncHandler(createQuiz),
);
router.patch(
  "/admin/:id",
  authMiddleware("Admin"),
  validateUpdateQuiz,
  asyncHandler(updateQuiz),
);
router.delete("/admin/:id", asyncHandler(deleteQuiz));

export default router;
