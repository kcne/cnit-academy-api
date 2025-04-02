import { Router } from "express";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";
import asyncHandler from "../middlewares/asyncHandler";
import { validateCreateProfile } from "../services/profileService";
import { validateUpdateProgram } from "../services/programService";

const router = Router();

router.get("/", asyncHandler(getAllProfiles));
router.get("/:id", asyncHandler(getProfileById));
router.post("/me", validateCreateProfile, asyncHandler(createProfile));
router.patch("/me", validateUpdateProgram, asyncHandler(updateProfile));
router.delete("/me", asyncHandler(deleteProfile));

export default router;
