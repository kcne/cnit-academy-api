import { Router } from "express";
import { getPfpById } from "../controllers/bucketController";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("/pfp/:id", asyncHandler(getPfpById));

export default router;
