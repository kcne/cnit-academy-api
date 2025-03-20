import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";

const router = Router();

router.get("/", authMiddleware, getAllProfiles);
router.get("/:id", authMiddleware, getProfileById);
router.post("/:id", authMiddleware, createProfile);
router.patch("/:id", authMiddleware, updateProfile);
router.delete("/:id", authMiddleware, deleteProfile);

export default router;
