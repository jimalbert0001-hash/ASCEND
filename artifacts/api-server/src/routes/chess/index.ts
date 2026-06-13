import { Router } from "express";
import accountsRouter from "./accounts.js";
import gamesRouter from "./games.js";
import statsRouter from "./stats.js";

const router = Router();

router.use("/accounts", accountsRouter);
router.use("/games", gamesRouter);
router.use("/stats", statsRouter);

export default router;
