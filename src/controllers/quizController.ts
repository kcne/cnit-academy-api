import { Request, Response } from "express";
import {
  createQuizWrapper,
  repositoryService,
  takeQuiz,
  validateAuthScope,
} from "../services/quizService";
import { z } from "zod";
import { AuthenticatedRequest, Role } from "../middlewares/authMiddleware";
import createHttpError from "http-errors";
import assert from "assert";

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

async function createQuiz(req: AuthenticatedRequest, res: Response) {
  const creatorId =
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined;
  const quiz = await createQuizWrapper(req.body, creatorId);

  res.status(201).json(quiz);
}

async function updateQuiz(req: AuthenticatedRequest, res: Response) {
  const creatorId =
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined;
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  if (creatorId) {
    if (!validateAuthScope(id, creatorId)) {
      throw createHttpError(403, "Only admins can edit foreign items");
    }
  }
  const quiz = await repositoryService.updateItem(id, req.body);

  res.json(quiz);
}

async function deleteQuiz(req: AuthenticatedRequest, res: Response) {
  const creatorId =
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined;
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  if (creatorId) {
    if (!validateAuthScope(id, creatorId)) {
      throw createHttpError(403, "Only admins can edit foreign items");
    }
  }
  await repositoryService.deleteItem(id);

  res.send();
}

async function submitQuiz(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
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
