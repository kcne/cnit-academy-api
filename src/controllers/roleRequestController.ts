import { Request, Response } from "express";
import * as RoleRequestService from "../services/roleRequestService";

async function getRoleRequests(req: Request, res: Response) {
  const users = await RoleRequestService.getRoleRequests();

  res.status(200).json(users);
}

async function sendRoleRequest(req: Request, res: Response) {
  try {
    const { userId, bio, age, photoURL, coverLetter, links } = req.body;

    const roleRequest = await RoleRequestService.sendRoleRequest(
      userId,
      bio,
      age,
      photoURL,
      coverLetter,
      links
    );
    res.status(200).json({ message: "Successfully role request is sent!" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

async function approveRoleRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const approvedRoleRequest = await RoleRequestService.approveRoleRequest(
      Number(id)
    );

    res.status(200).json({ message: "Successfully role request is approved" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

async function declineRoleRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const declineRoleRequest = await RoleRequestService.declineRoleRequest(
      Number(id)
    );

    res.status(200).json({ message: "Successfully role request is declined" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export {
  getRoleRequests,
  sendRoleRequest,
  approveRoleRequest,
  declineRoleRequest,
};
