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
  authMiddleware("Admin"),
  validateCreateProgram,
  asyncHandler(createProgram),
);
router.patch(
  "/admin/:id",
  authMiddleware("Admin"),
  validateUpdateProgram,
  asyncHandler(updateProgram),
);
router.put(
  "/admin/:id/enroll",
  authMiddleware("Admin"),
  asyncHandler(enrollToProgram),
);
router.put(
  "/admin/:id/finish",
  authMiddleware("Admin"),
  asyncHandler(finishProgram),
);
router.delete(
  "/admin/:id",
  authMiddleware("Admin"),
  asyncHandler(deleteProgram),
);

export default router;
