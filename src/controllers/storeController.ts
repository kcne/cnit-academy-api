import { Request, Response } from "express";
import { buy, repositoryService } from "../services/storeService";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

async function getAllBadges(req: Request, res: Response) {
  const { page, limit } = req.query;

  const badges = await repositoryService.getAll({
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });
  res.json(badges);
}

async function getBadgeById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const badge = await repositoryService.findItem(id);

  res.json(badge);
}

async function createBadge(req: Request, res: Response) {
  const badge = await repositoryService.createItem(req.body);

  res.status(201).json(badge);
}

async function buyBadge(req: AuthenticatedRequest, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const userId = req.user.id;

  await buy(id, userId);

  res.send();
}

async function updateBadgeById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  const badge = await repositoryService.updateItem(id, req.body);

  res.json(badge);
}

async function deleteBadgeById(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);
  await repositoryService.deleteItem(id);

  res.send();
}

export {
  getAllBadges,
  getBadgeById,
  deleteBadgeById,
  updateBadgeById,
  createBadge,
  buyBadge,
};
