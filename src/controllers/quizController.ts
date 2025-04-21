import { Request, Response } from "express";
import {
  createQuizWrapper,
  repositoryService,
  takeQuiz,
} from "../services/quizService";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

async function getAllQuizzes(req: Request, res: Response) {
  const { page, limit } = req.query;

  const quizzes = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });
  res.json(quizzes);
}

async function getQuiz(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const blog = await repositoryService.findItem(id);
  res.json(blog);
}

async function createQuiz(req: Request, res: Response) {
  const quiz = await createQuizWrapper(req.body);

  res.status(201).json(quiz);
}

async function updateQuiz(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const quiz = await repositoryService.updateItem(id, req.body);

  res.json(quiz);
}

async function deleteQuiz(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(id);

  res.send();
}

async function submitQuiz(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;
  const answers = req.body;
  const quizId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  const { maxScore, score } = await takeQuiz(quizId, userId, answers);

  res.json({ maxScore, score, ratio: score / maxScore });
}

export {
  getQuiz,
  getAllQuizzes,
  deleteQuiz,
  updateQuiz,
  createQuiz,
  submitQuiz,
};

// async function startQuiz(req: AuthenticatedRequest, res: Response) {
//   if (!req.user) {
//     throw new Error("AuthenticatedRequest.user is undefined");
//   }
//   const userId = req.user.id;
//   const quizId = await z.coerce
//     .number()
//     .positive()
//     .int()
//     .parseAsync(req.params.id);
//
//   await changeStatus(userId, quizId, false);
//
//   res.send();
// }
//
// async function finishQuiz(req: AuthenticatedRequest, res: Response) {
//   if (!req.user) {
//     throw new Error("AuthenticatedRequest.user is undefined");
//   }
//   const userId = req.user.id;
//   const quizId = await z.coerce
//     .number()
//     .positive()
//     .int()
//     .parseAsync(req.params.id);
//
//   await changeStatus(userId, quizId, true);
//
//   res.send();
// }
