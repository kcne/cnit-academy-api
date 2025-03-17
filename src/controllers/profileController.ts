import { Request, Response } from "express";
import {
  addProfile,
  getProfiles,
  getProfile,
  changeProfile,
  removeProfile,
} from "../services/profileService";

async function getAllProfiles(_req: Request, res: Response) {
  const profiles = await getProfiles();

  res.status(200).json(profiles);
}
async function getProfileById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res
      .status(400)
      .json({ error: "Query paramater id must be a number larger than 0" });
    return;
  }

  const profile = await getProfile(id);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.status(200).json(profile);
}

async function createProfile(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res
      .status(400)
      .json({ error: "Query paramater id must be a number larger than 0" });
    return;
  }

  const profile = await addProfile(id, req.body);
  if (!profile) {
    res.status(404).json({ error: "User not found" });
  }

  res.status(201).json(profile);
}

async function updateProfile(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res
      .status(400)
      .json({ error: "Query paramater id must be a number larger than 0" });
    return;
  }

  const profile = await changeProfile(id, req.body);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  res.status(200).json(profile);
}

async function deleteProfile(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res
      .status(400)
      .json({ error: "Query paramater id must be a number larger than 0" });
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
