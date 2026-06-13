import { Router } from "express";
import { db } from "@workspace/db";
import { chessAccounts } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../../lib/logger.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [account] = await db
      .select()
      .from(chessAccounts)
      .where(eq(chessAccounts.userId, userId));
    res.json({
      chesscomUsername: account?.chesscomUsername ?? "princeplaysch",
      lichessUsername: account?.lichessUsername ?? "princeplaysch",
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch chess accounts");
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { chesscomUsername, lichessUsername } = req.body;
  try {
    const [existing] = await db
      .select()
      .from(chessAccounts)
      .where(eq(chessAccounts.userId, userId));

    if (existing) {
      const [updated] = await db
        .update(chessAccounts)
        .set({
          chesscomUsername: chesscomUsername || null,
          lichessUsername: lichessUsername || null,
          updatedAt: new Date(),
        })
        .where(eq(chessAccounts.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(chessAccounts)
        .values({
          userId,
          chesscomUsername: chesscomUsername || null,
          lichessUsername: lichessUsername || null,
        })
        .returning();
      res.json(created);
    }
  } catch (err) {
    logger.error({ err }, "Failed to save chess accounts");
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
