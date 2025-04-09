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

const router = Router();

router.get("/", asyncHandler(getAllPrograms));
router.get("/:id", asyncHandler(getProgramById));
router.put("/:id/apply", asyncHandler(applyToProgram));

// admin routes
router.post("/admin", validateCreateProgram, asyncHandler(createProgram));
router.patch("/admin/:id", validateUpdateProgram, asyncHandler(updateProgram));
router.put("/admin/:id/enroll", asyncHandler(enrollToProgram));
router.put("/admin/:id/finish", asyncHandler(finishProgram));
router.delete("/admin/:id", asyncHandler(deleteProgram));

export default router;
