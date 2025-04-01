import { Router } from "express";
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  applyToProgram,
  enrollToProgram,
} from "../controllers/programController";
import {
  validateCreateProgram,
  validateUpdateProgram,
} from "../services/programService";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getAllPrograms));
router.get("/:id", asyncHandler(getProgramById));
router.post("/", validateCreateProgram, asyncHandler(createProgram));
router.put("/:id", validateUpdateProgram, asyncHandler(updateProgram));
router.delete("/:id", asyncHandler(deleteProgram));
router.put("/:id/apply", asyncHandler(applyToProgram));
router.put("/:id/enroll", asyncHandler(enrollToProgram));

export default router;
