import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient(); 

interface LeaderboardUser {
  id: number;
  firstName: string;
  lastName: string;
  updatedAt: Date;
  totalCoins: number;
}

export const getLeaderboardData = async (domain: string | undefined): Promise<LeaderboardUser[]> => {
  try {
    const dateFilter = domain === "weekly" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : undefined;

    const leaderboard = await prisma.user.findMany({
      where: dateFilter ? { updatedAt: { gte: dateFilter } } : {}, 
      orderBy: { totalCoins: "desc" },
      select: { id: true, firstName: true, lastName: true, totalCoins: true, updatedAt: true },
    });

    return leaderboard;
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching leaderboard data");
  }
};

