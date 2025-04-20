import { Router } from "express";
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  applyToProgram,
  enrollToProgram,
  finishProgram,
} from "../controllers/programController";
import {
  validateCreateProgram,
  validateUpdateProgram,
} from "../services/programService";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllPrograms));
router.get("/:id", asyncHandler(getProgramById));
router.put("/:id/apply", asyncHandler(applyToProgram));

// admin routes
router.post(
  "/admin",
  authMiddleware(["INSTRUCTOR"]),
  validateCreateProgram,
  asyncHandler(createProgram),
);
router.patch(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  validateUpdateProgram,
  asyncHandler(updateProgram),
);
router.put(
  "/admin/:id/enroll",
  authMiddleware(["INSTRUCTOR"]),
  asyncHandler(enrollToProgram),
);
router.put(
  "/admin/:id/finish",
  authMiddleware(["INSTRUCTOR"]),
  asyncHandler(finishProgram),
);
router.delete(
  "/admin/:id",
  authMiddleware(["INSTRUCTOR"]),
  asyncHandler(deleteProgram),
);

export default router;
