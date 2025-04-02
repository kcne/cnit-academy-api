import { Request, Response } from "express";
import {
  getAll,
  findItem,
  createItem,
  updateItem,
  deleteItem,
  applyDeprecated,
  enrollDeprecated,
} from "../services/programService";
import { z } from "zod";

async function getAllPrograms(_req: Request, res: Response) {
  const programs = await getAll({
    pagination: { page: 1, limit: Number.MAX_SAFE_INTEGER }, // TODO: add pagination
  });
  res.json(programs);
}

async function getProgramById(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const program = await findItem(id);
  res.json(program);
}

async function createProgram(req: Request, res: Response) {
  const newProgram = req.body;
  const program = await createItem(newProgram);
  res.json(program);
}

async function updateProgram(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const newProgram = req.body;
  const program = await updateItem(id, newProgram);
  res.json(program);
}

async function deleteProgram(req: Request, res: Response) {
  const id = await z.number().positive().int().parseAsync(req.params.id);
  const program = await deleteItem(id);
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
