import { Router } from "express";
import { db } from "@workspace/db";
import { chessGames } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../../lib/logger.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { platform, limit = "50" } = req.query;
  try {
    let query = db
      .select()
      .from(chessGames)
      .where(eq(chessGames.userId, userId))
      .orderBy(desc(chessGames.gameDate))
      .limit(parseInt(limit as string) || 50);

    if (platform) {
      query = db
        .select()
        .from(chessGames)
        .where(and(eq(chessGames.userId, userId), eq(chessGames.platform, platform as string)))
        .orderBy(desc(chessGames.gameDate))
        .limit(parseInt(limit as string) || 50);
    }

    const games = await query;
    res.json(games);
  } catch (err) {
    logger.error({ err }, "Failed to fetch chess games");
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const games = req.body.games;
  if (!Array.isArray(games)) {
    res.status(400).json({ error: "games array required" });
    return;
  }
  try {
    const inserted = [];
    for (const g of games) {
      try {
        const [row] = await db
          .insert(chessGames)
          .values({
            userId,
            platform: g.platform,
            externalId: g.externalId,
            pgn: g.pgn || null,
            fen: g.fen || null,
            result: g.result,
            playerColor: g.playerColor,
            playerRating: g.playerRating || null,
            opponentUsername: g.opponentUsername || null,
            opponentRating: g.opponentRating || null,
            openingName: g.openingName || null,
            openingEco: g.openingEco || null,
            timeControl: g.timeControl || null,
            gameDurationSecs: g.gameDurationSecs || null,
            gameDate: new Date(g.gameDate),
            movesCount: g.movesCount || null,
          })
          .onConflictDoNothing()
          .returning();
        if (row) inserted.push(row);
      } catch {
        // skip duplicates
      }
    }
    res.json({ inserted: inserted.length, games: inserted });
  } catch (err) {
    logger.error({ err }, "Failed to save chess games");
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:userId/:gameId/analysis", async (req, res) => {
  const { gameId } = req.params;
  const { accuracy, bestMove, worstMove, analysisNotes } = req.body;
  try {
    const [updated] = await db
      .update(chessGames)
      .set({
        isAnalyzed: true,
        accuracy: accuracy ?? null,
        bestMove: bestMove || null,
        worstMove: worstMove || null,
        analysisNotes: analysisNotes || null,
      })
      .where(eq(chessGames.id, gameId))
      .returning();
    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to save analysis");
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
