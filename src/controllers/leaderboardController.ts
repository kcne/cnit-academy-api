import { Request, Response } from "express";
import { getLeaderboardData } from "../services/leaderboardService";

async function getLeaderboard(_req: Request, res: Response) {
  const leaderboard = await getLeaderboardData(false);

  res.json(leaderboard);
}

async function getLeaderboardWeekly(_req: Request, res: Response) {
  const leaderboard = await getLeaderboardData(true);

  res.json(leaderboard);
}

export { getLeaderboard, getLeaderboardWeekly };
