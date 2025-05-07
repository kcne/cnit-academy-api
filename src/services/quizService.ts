import { z } from "zod";
import prisma from "../prisma";
import { PrismaRepositoryService } from "./prismaRepositoryService";
import createHttpError from "http-errors";
import { validateRequest } from "../middlewares/validate";

const repositoryService = new PrismaRepositoryService(prisma.quiz, {
  id: true,
  questions: {
    select: {
      id: true,
      text: true,
      quizId: true,
      score: true,
      options: true,
    },
  },
});

const QuizSchema = z.object({
  id: z.number().int().positive(),
  questions: z.array(
    z.object({
      text: z.string().max(4096),
      options: z.array(z.string().max(4096)),
      answer: z.string().max(4096),
      score: z.number().int().max(1_000_000),
    }),
  ),
});
const AnswerSchema = z.record(
  z.coerce.number().int().positive(),
  z.string().max(4096),
);
const validateSubmitQuiz = validateRequest(AnswerSchema);
const validateCreateQuiz = validateRequest(
  QuizSchema.transform((el) => ({
    ...el,
    questions: { create: el.questions },
  })),
);
const validateUpdateQuiz = validateRequest(
  QuizSchema.partial().transform((el) => ({
    ...el,
    questions: { create: el.questions },
  })),
);

async function createQuizWrapper(
  data: z.infer<typeof QuizSchema>,
  userId?: number,
) {
  const lecture = await prisma.lecture.findUnique({
    where: { id: data.id, userId },
    select: {
      id: true,
      Quiz: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!lecture) {
    throw createHttpError(404, "Lecture not found");
  }
  if (lecture.Quiz?.id) {
    throw createHttpError(409, "Quiz already exists for this lecture");
  }
  return repositoryService.createItem(data);
}

async function takeQuiz(
  id: number,
  userId: number,
  answers: z.infer<typeof AnswerSchema>,
) {
  const quiz = await prisma.quiz.findUnique({
    where: {
      id,
    },
    select: {
      questions: {
        select: {
          id: true,
          answer: true,
          score: true,
        },
      },
    },
  });
  if (!quiz) {
    throw createHttpError(404, "Quiz not found");
  }

  let score = 0;
  let maxScore = 0;
  for (const question of quiz?.questions) {
    if (question.answer === answers[question.id]) {
      score += question.score;
    }
    maxScore += question.score;
  }

  await prisma.userQuizAttempt.create({
    data: {
      quizId: id,
      userId,
      score: score / maxScore,
    },
  });

  return { maxScore, score };
}

async function validateAuthScope(lectureId: number, userId: number) {
  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  return lecture ? lecture.userId === userId : true;
}

export {
  repositoryService,
  validateSubmitQuiz,
  validateCreateQuiz,
  validateUpdateQuiz,
  takeQuiz,
  createQuizWrapper,
  validateAuthScope,
};
