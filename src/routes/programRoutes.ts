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

const router = Router();

router.get("/", getAllPrograms);
router.get("/:id", getProgramById);
router.post("/", validateCreateProgram, createProgram);
router.put("/:id", validateUpdateProgram, updateProgram);
router.delete("/:id", deleteProgram);
router.put("/:id/apply", applyToProgram);
router.put("/:id/enroll", enrollToProgram);

export default router;

