import { Router } from "express";
import { cleanPfpsRoutine, getPfpById } from "../controllers/bucketController";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware, { Role } from "../middlewares/authMiddleware";

const router = Router();

router.get("/pfp/:id", asyncHandler(getPfpById));
router.delete(
  "/pfp",
  authMiddleware([Role.admin]),
  asyncHandler(cleanPfpsRoutine),
);

export default router;
