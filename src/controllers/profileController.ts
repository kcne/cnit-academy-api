import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import {
  addProfile,
  getProfiles,
  getProfile,
  changeProfile,
  removeProfile,
} from "../services/profileService";
import { z } from "zod";

async function getAllProfiles(req: AuthenticatedRequest, res: Response) {
  const { page, limit } = req.query;

  const profiles = await getProfiles({
    page: Number(page ?? 1),
    limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
  });

  res.json(profiles);
}

async function getProfileById(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id =
    req.params.id === "me"
      ? req.user.id
      : await z.coerce.number().positive().int().parseAsync(req.params.id);

  const profile = await getProfile(id);

  res.json(profile);
}

async function createProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id = req.user.id;

  const profile = await addProfile(id, req.body);

  res.status(201).json(profile);
}

async function updateProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id = req.user.id;

  const profile = await changeProfile(id, req.body);

  res.json(profile);
}

async function deleteProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id = req.user.id;

  await removeProfile(id);
  res.send();
}

export {
  getAllProfiles,
  createProfile,
  getProfileById,
  updateProfile,
  deleteProfile,
};
