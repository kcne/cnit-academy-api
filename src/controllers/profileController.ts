import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Response } from "express";
import {
  addProfile,
  getProfiles,
  getProfile,
  changeProfile,
  removeProfile,
} from "../services/profileService";

async function getAllProfiles(_req: AuthenticatedRequest, res: Response) {
  const profiles = await getProfiles();

  res.json(profiles);
}
async function getProfileById(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id = req.params.id === "me" ? req.user.id : Number(req.params.id);

  const profile = await getProfile(id);

  res.json(profile);
}

async function createProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id = req.user.id;

  const profile = await addProfile(id, req.body); // TODO: add validation

  res.json(profile);
}

async function updateProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  const id = req.user.id;

  const profile = await changeProfile(id, req.body); // TODO: add validation

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
