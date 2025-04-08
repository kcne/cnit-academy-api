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
router.post("/", validateCreateProgram, asyncHandler(createProgram));
router.patch("/:id", validateUpdateProgram, asyncHandler(updateProgram));
router.put("/:id/apply", asyncHandler(applyToProgram));
router.put("/:id/enroll", asyncHandler(enrollToProgram));
router.put("/:id/finish", asyncHandler(finishProgram));
router.delete("/:id", asyncHandler(deleteProgram));

export default router;
