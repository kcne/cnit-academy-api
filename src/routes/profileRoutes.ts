import { Router } from "express";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";
import asyncHandler from "../middlewares/asyncHandler";
import {
  validateCreateProfile,
  validateUpdateProfile,
} from "../services/profileService";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllProfiles));
router.get("/:id", authMiddleware, asyncHandler(getProfileById));
router.post(
  "/me",
  authMiddleware,
  validateCreateProfile,
  asyncHandler(createProfile),
);
router.patch(
  "/me",
  authMiddleware,
  validateUpdateProfile,
  asyncHandler(updateProfile),
);
router.delete("/me", authMiddleware, asyncHandler(deleteProfile));

export default router;
