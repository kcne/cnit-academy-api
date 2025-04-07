import { Request, Response } from "express";
import { changeStatus, repositoryService } from "../services/programService";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

async function getAllPrograms(req: Request, res: Response) {
  const { page, limit } = req.query;

  const programs = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });
  res.json(programs);
}

async function getProgramById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const program = await repositoryService.findItem(id);
  res.json(program);
}

async function createProgram(req: Request, res: Response) {
  const newProgram = req.body;
  const program = await repositoryService.createItem(newProgram);
  res.status(201).json(program);
}

async function updateProgram(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const newProgram = req.body;
  const program = await repositoryService.updateItem(id, newProgram);
  res.json(program);
}

async function deleteProgram(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const program = await repositoryService.deleteItem(id);
  res.json(program);
}

async function applyToProgram(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;
  const programId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await changeStatus(userId, programId, true, false, false);

  res.send();
}

async function enrollToProgram(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;
  const programId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await changeStatus(userId, programId, true, true, false);

  res.send();
}

async function finishProgram(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;
  const programId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await changeStatus(userId, programId, true, true, true);

  res.send();
}

export {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  applyToProgram,
  enrollToProgram,
  finishProgram,
};
