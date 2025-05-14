import { Request, Response } from "express";
import * as RoleRequestService from "../services/RoleRequestService";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import assert from "node:assert";

async function getAllRoleRequests(_req: Request, res: Response) {
  const users = await RoleRequestService.getRoleRequests(false);

  res.status(200).json(users);
}

async function getPendingRoleRequests(_req: Request, res: Response) {
  const users = await RoleRequestService.getRoleRequests(false);

  res.status(200).json(users);
}

async function sendRoleRequest(req: AuthenticatedRequest, res: Response) {
  assert(req.user);
  const userId = req.user.id;

  await RoleRequestService.sendRoleRequest(req.body, userId);
  res.status(200).json({ message: "Successfully role request is sent!" });
}

async function approveRoleRequest(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  await RoleRequestService.approveRoleRequest(id);

  res.sendStatus(200);
}

async function declineRoleRequest(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  await RoleRequestService.declineRoleRequest(id);

  res.sendStatus(200);
}

export {
  getAllRoleRequests,
  getPendingRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
};
