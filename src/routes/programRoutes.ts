import {Router} from "express";
import {
    getAllPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
    AppliedToProgram,
    AcceptedToProgram
} from "../controllers/programController";

const router = Router();

router.get("/", getAllPrograms);
router.get("/:id", getProgramById);
router.post("/", createProgram);
router.put("/:id", updateProgram);
router.delete("/:id", deleteProgram);
router.put("/:id/apply", AppliedToProgram);
router.put("/:id/accept", AcceptedToProgram);

export default router;