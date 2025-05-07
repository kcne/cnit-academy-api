import { Router } from "express";
import { cleanPfpsRoutine, getPfpById } from "../controllers/bucketController";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/pfp/:id", asyncHandler(getPfpById));
router.delete(
  "/pfp",
  authMiddleware(["Admin"]),
  asyncHandler(cleanPfpsRoutine),
);

export default router;
