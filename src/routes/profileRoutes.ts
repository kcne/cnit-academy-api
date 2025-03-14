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
router.post("/", authMiddleware, createProfile);
router.put("/:id", authMiddleware, updateProfile);
router.delete("/:id", authMiddleware, deleteProfile);

export default router;
