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
  getMyPrograms,
} from "../controllers/programController";
import {
  validateCreateProgram,
  validateUpdateProgram,
} from "../services/programService";
import asyncHandler from "../middlewares/asyncHandler";
import authMiddleware, { Role } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", asyncHandler(getAllPrograms));
router.get("/my", asyncHandler(getMyPrograms));
router.get("/:id", asyncHandler(getProgramById));
router.put("/:id/apply", asyncHandler(applyToProgram));

// admin routes
router.post(
  "/admin",
  authMiddleware([Role.instructor]),
  validateCreateProgram,
  asyncHandler(createProgram),
);
router.patch(
  "/admin/:id",
  authMiddleware([Role.instructor]),
  validateUpdateProgram,
  asyncHandler(updateProgram),
);
router.put(
  "/admin/:id/enroll",
  authMiddleware([Role.instructor]),
  asyncHandler(enrollToProgram),
);
router.put(
  "/admin/:id/finish",
  authMiddleware([Role.instructor]),
  asyncHandler(finishProgram),
);
router.delete(
  "/admin/:id",
  authMiddleware([Role.instructor]),
  asyncHandler(deleteProgram),
);

export default router;
