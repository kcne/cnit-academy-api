import { Router } from "express";
import {
  getLeaderboard,
  getLeaderboardWeekly,
} from "../controllers/leaderboardController";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getLeaderboard));
router.get("/weekly", asyncHandler(getLeaderboardWeekly));

export default router;
