import {Router} from "express";
import {
    getAllPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
    ApplyToProgram,
    EnrollToProgram
} from "../controllers/programController";
import { validateUpdateProgram } from "../services/programService";
import { validateCreateProgram } from "../services/programService";

const router = Router();


router.get("/", getAllPrograms);
router.get("/:id", getProgramById);
router.post("/", validateCreateProgram, createProgram);
router.put("/:id", validateUpdateProgram,  updateProgram);
router.delete("/:id", deleteProgram);
router.put("/:id/apply", ApplyToProgram);
router.put("/:id/enroll", EnrollToProgram);

export default router;