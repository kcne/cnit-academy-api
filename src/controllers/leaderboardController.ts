import { Request, Response } from "express";
import { getLeaderboardData } from "../services/leaderboardService";

async function getLeaderboard(req: Request, res: Response) {
  const { page, limit } = req.query;

  const leaderboard = await getLeaderboardData(false, {
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });

  res.json(leaderboard);
}

async function getLeaderboardWeekly(req: Request, res: Response) {
  const { page, limit } = req.query;

  const leaderboard = await getLeaderboardData(true, {
    pagination: {
      page: Number(page ?? 1),
      limit: Number(page ? (limit ?? 10) : Number.MAX_SAFE_INTEGER),
    },
  });

  res.json(leaderboard);
}

export { getLeaderboard, getLeaderboardWeekly };
