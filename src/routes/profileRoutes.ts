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
router.get("/:id", authMiddleware(), asyncHandler(getProfileById));
router.patch(
  "/me",
  authMiddleware(),
  validateUpdateProfile,
  asyncHandler(updateProfile),
);
router.delete("/me", authMiddleware(), asyncHandler(deleteProfile));

// admin routes
// createProfile probably has no practical use
router.post(
  "/admin/:id",
  authMiddleware("Admin"),
  validateCreateProfile,
  asyncHandler(createProfile),
);
router.patch(
  "/admin/:id",
  authMiddleware("Admin"),
  validateUpdateProfile,
  asyncHandler(updateProfile),
);
router.delete(
  "/admin/:id",
  authMiddleware("Admin"),
  asyncHandler(deleteProfile),
);

export default router;
