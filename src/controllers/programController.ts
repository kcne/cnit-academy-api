import { Request, Response } from "express";
import {
  apply,
  enrollApplicantsInProgram,
  markProgramAsCompleted,
  repositoryService,
  customGetAll,
  customFindItem,
} from "../services/programService";
import { z } from "zod";
import { AuthenticatedRequest, Role } from "../middlewares/authMiddleware";
import assert from "assert";

function renameFields(input: any) {
  return {
    ...input,
    _count: undefined,
    applied: input._count.UserProgram,
  };
}

async function getAllPrograms(req: Request, res: Response) {
  const { page, limit } = req.query;

  const programs = await customGetAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });

  res.json(programs);
}

async function getMyPrograms(req: AuthenticatedRequest, res: Response) {
  const { page, limit } = req.query;
  assert(req.user);
  const userId = req.user.id;

  const programs = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
    filters: [
      {
        field: "UserProgram",
        value: { some: { userId } },
        operator: "equals",
      },
    ],
  });

  res.json({
    data: programs.data.map((old: any) => renameFields(old)),
    meta: programs.meta,
  });
}

async function getProgramsByUserId(req: AuthenticatedRequest, res: Response) {
  const { page, limit } = req.query;
  assert(req.user);
  const userId =
    req.params.userId === "me"
      ? req.user.id
      : z.coerce.number().positive().int().parseAsync(req.params.userId);

  const programs = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
    filters: [
      {
        field: "userId",
        value: userId,
        operator: "equals",
      },
    ],
  });

  res.json({
    data: programs.data.map((old: any) => renameFields(old)),
    meta: programs.meta,
  });
}

async function getProgramById(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const userId = req.user.id;
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const program = await customFindItem(id, userId);

  res.json(program);
}

async function createProgram(req: AuthenticatedRequest, res: Response) {
  const program = await repositoryService.createItem({
    ...req.body,
    userId: req.user?.id,
  });

  res.status(201).json(renameFields(program));
}

async function updateProgram(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const program = await repositoryService.updateItem(
    id,
    req.body,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );

  res.json(renameFields(program));
}

async function deleteProgram(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  const program = await repositoryService.deleteItem(
    id,
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined,
  );

  res.json(renameFields(program));
}

async function applyToProgram(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const userId = req.user.id;
  const programId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await apply(userId, programId);

  res.send();
}

async function enrollToProgram(req: AuthenticatedRequest, res: Response) {
  const creatorId =
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined;
  const userIds = await z.coerce
    .number()
    .positive()
    .int()
    .array()
    .parseAsync(req.body);
  const programId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await enrollApplicantsInProgram(userIds, programId, creatorId);

  res.send();
}

async function finishProgram(req: AuthenticatedRequest, res: Response) {
  const creatorId =
    req.user?.role === Role.admin ? (req.user?.id ?? -1) : undefined;
  const programId = await z.coerce
    .number()
    .positive()
    .int()
    .parseAsync(req.params.id);

  await markProgramAsCompleted(programId, creatorId);

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
  getMyPrograms,
  getProgramsByUserId,
};
