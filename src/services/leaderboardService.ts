import { PrismaClient } from "@prisma/client";
import {
  createPaginatedResponse,
  PaginatedResult,
  QueryOptions,
} from "../utils/queryBuilder";
const prisma = new PrismaClient();

interface LeaderboardUser {
  id: number;
  firstName: string;
  lastName: string;
  updatedAt: Date;
  totalCoins: number;
}

export async function getLeaderboardData(
  weekly: boolean,
  opt: QueryOptions<string>,
): Promise<PaginatedResult<LeaderboardUser>> {
  const [leaderboard, total] = await Promise.all([
    prisma.user.findMany({
      where: weekly
        ? { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        : {},
      orderBy: { totalCoins: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalCoins: true,
        updatedAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return createPaginatedResponse(leaderboard, total, opt.pagination);
}
