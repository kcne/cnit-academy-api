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

  res.status(200).json(profiles);
}
async function getProfileById(req: AuthenticatedRequest, res: Response) {
  const id = req.params.id === "me" ? req.user?.id : Number(req.params.id);
  if (id === undefined) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  if (Number.isNaN(id)) {
    res.status(400).json({
      error: 'Query paramater id must be a number larger than 0 or "me"',
    });
    return;
  }

  const profile = await getProfile(id);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.status(200).json(profile);
}

async function createProfile(req: AuthenticatedRequest, res: Response) {
  const id = req.user?.id;
  if (id === undefined) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  if (req.params.id !== "me") {
    res.status(403).json({
      error:
        'Modifying foreign profiles is forbidden for now. Query paramater id must be "me"',
    });
    return;
  }

  const profile = await addProfile(id, req.body);
  if (!profile) {
    res.status(404).json({ error: "User not found" });
  }

  res.status(201).json(profile);
}

async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const id = req.user?.id;
  if (id === undefined) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  if (req.params.id !== "me") {
    res.status(403).json({
      error:
        'Modifying foreign profiles is forbidden for now. Query paramater id must be "me"',
    });
    return;
  }

  const profile = await changeProfile(id, req.body);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.status(200).json(profile);
}

async function deleteProfile(req: AuthenticatedRequest, res: Response) {
  const id = req.user?.id;
  if (id === undefined) {
    throw new Error("AuthenticatedRequest.user is undefined");
  }
  if (req.params.id !== "me") {
    res.status(403).json({
      error:
        'Modifying foreign profiles is forbidden for now. Query paramater id must be "me"',
    });
    return;
  }

  try {
    await removeProfile(id);
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Profile not found" });
  }
}

export {
  getAllProfiles,
  createProfile,
  getProfileById,
  updateProfile,
  deleteProfile,
};
