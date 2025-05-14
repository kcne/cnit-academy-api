import { Router } from "express";
import {
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  updateProfilePhoto,
} from "../controllers/profileController";
import asyncHandler from "../middlewares/asyncHandler";
import { validateUpdateProfile } from "../services/profileService";
import authMiddleware, { Role } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllProfiles));
router.get("/:id", authMiddleware(), asyncHandler(getProfileById));
router.post("/me/pfp", authMiddleware(), asyncHandler(updateProfilePhoto));
router.patch(
  "/me",
  authMiddleware(),
  validateUpdateProfile,
  asyncHandler(updateProfile),
);
router.delete("/me", authMiddleware(), asyncHandler(deleteProfile));

// admin routes
router.patch(
  "/admin/:id",
  authMiddleware([Role.admin]),
  validateUpdateProfile,
  asyncHandler(updateProfile),
);
router.delete(
  "/admin/:id",
  authMiddleware([Role.admin]),
  asyncHandler(deleteProfile),
);

export default router;
