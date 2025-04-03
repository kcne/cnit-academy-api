import { Request, Response } from "express";
import {
  repositoryService,
  applyDeprecated,
  enrollDeprecated,
} from "../services/programService";
import { z } from "zod";

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
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const program = await repositoryService.findItem(id);
  res.json(program);
}

async function createProgram(req: Request, res: Response) {
  const newProgram = req.body;
  const program = await repositoryService.createItem(newProgram);
  res.json(program);
}

async function updateProgram(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const newProgram = req.body;
  const program = await repositoryService.updateItem(id, newProgram);
  res.json(program);
}

async function deleteProgram(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const program = await repositoryService.deleteItem(id);
  res.json(program);
}

async function applyToProgram(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  await applyDeprecated(id);
  res.send();
}

async function enrollToProgram(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  await enrollDeprecated(id);
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
};
