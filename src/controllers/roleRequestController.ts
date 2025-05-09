import { Request, Response } from "express";
import * as RoleRequestService from "../services/RoleRequestService";
import { z } from "zod";

async function getAllRoleRequests(_req: Request, res: Response) {
  const users = await RoleRequestService.getRoleRequests(false);

  res.status(200).json(users);
}

async function getPendingRoleRequests(_req: Request, res: Response) {
  const users = await RoleRequestService.getRoleRequests(false);

  res.status(200).json(users);
}

async function sendRoleRequest(req: Request, res: Response) {
  await RoleRequestService.sendRoleRequest(req.body);
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
