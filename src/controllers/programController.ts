import { Request, Response } from "express";
import { changeStatus, repositoryService } from "../services/programService";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

function renameFields(input: any) {
  return {
    ...input,
    _count: undefined,
    appliedCount: input._count.UserProgram,
  };
}

async function getAllPrograms(req: Request, res: Response) {
  const { page, limit } = req.query;

  const programs = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });

  const { data, meta } = programs;
  return res.json({
    data: data.map((old: any) => renameFields(old)),
    meta,
  });
}

async function getProgramById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const program = await repositoryService.findItem(id);

  res.json(renameFields(program));
}

async function createProgram(req: Request, res: Response) {
  const program = await repositoryService.createItem(req.body);

  res.status(201).json(renameFields(program));
}

async function updateProgram(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const program = await repositoryService.updateItem(id, req.body);

  res.json(renameFields(program));
}

async function deleteProgram(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const program = await repositoryService.deleteItem(id);

  res.json(renameFields(program));
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

  await changeStatus(userId, programId, false, true, false);

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

  await changeStatus(userId, programId, false, false, true);

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
