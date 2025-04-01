import { Router } from "express";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getAllProfiles));
router.get("/:id", asyncHandler(getProfileById));
router.post("/me", asyncHandler(createProfile));
router.patch("/me", asyncHandler(updateProfile));
router.delete("/me", asyncHandler(deleteProfile));

export default router;
