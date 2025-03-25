import { Request, Response } from "express";
import { getLeaderboardData } from "../services/leaderboardService"; 

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain } = req.query; 

    const leaderboard = await getLeaderboardData(domain as string | undefined); 

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
