import { Router } from "express";
import { db } from "@workspace/db";
import { chessGames } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "../../lib/logger.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const allGames = await db
      .select()
      .from(chessGames)
      .where(eq(chessGames.userId, userId));

    const wins = allGames.filter((g) => g.result === "win").length;
    const losses = allGames.filter((g) => g.result === "loss").length;
    const draws = allGames.filter((g) => g.result === "draw").length;
    const total = wins + losses + draws;

    const openings: Record<string, number> = {};
    for (const g of allGames) {
      if (g.openingName) {
        openings[g.openingName] = (openings[g.openingName] ?? 0) + 1;
      }
    }
    const topOpenings = Object.entries(openings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const hourPerformance: Record<number, { wins: number; losses: number; draws: number; total: number }> = {};
    for (const g of allGames) {
      const h = new Date(g.gameDate).getHours();
      if (!hourPerformance[h]) hourPerformance[h] = { wins: 0, losses: 0, draws: 0, total: 0 };
      hourPerformance[h].total++;
      if (g.result === "win") hourPerformance[h].wins++;
      else if (g.result === "loss") hourPerformance[h].losses++;
      else hourPerformance[h].draws++;
    }

    const ratingTimeline = allGames
      .filter((g) => g.playerRating)
      .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())
      .map((g) => ({ date: g.gameDate, rating: g.playerRating, platform: g.platform }));

    res.json({
      wins,
      losses,
      draws,
      total,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
      topOpenings,
      hourPerformance: Object.entries(hourPerformance).map(([hour, stats]) => ({
        hour: parseInt(hour),
        ...stats,
      })),
      ratingTimeline,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch chess stats");
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
