import { Request, Response } from "express";
import * as RoleRequestService from "../services/RoleRequestService";
import { z } from "zod";

async function getRoleRequests(_req: Request, res: Response) {
  const users = await RoleRequestService.getRoleRequests();

  res.status(200).json(users);
}

async function sendRoleRequest(req: Request, res: Response) {
  const { userId, bio, age, photoURL, coverLetter, links } = req.body;

  await RoleRequestService.sendRoleRequest(
    userId,
    bio,
    age,
    photoURL,
    coverLetter,
    links,
  );
  res.status(200).json({ message: "Successfully role request is sent!" });
}

async function approveRoleRequest(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  await RoleRequestService.approveRoleRequest(id);

  res.status(200).json({ message: "Successfully role request is approved" });
}

async function declineRoleRequest(req: Request, res: Response) {
  const id = await z.coerce.number().positive().int().parseAsync(req.params.id);

  await RoleRequestService.declineRoleRequest(id);

  res.status(200).json({ message: "Successfully role request is declined" });
}

export {
  getRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
};
