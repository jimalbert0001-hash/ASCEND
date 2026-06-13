import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai/index.js";
import logRouter from "./log/index.js";
import dataRouter from "./data/index.js";
import chessRouter from "./chess/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/ai", aiRouter);
router.use("/log", logRouter);
router.use("/data", dataRouter);
router.use("/chess", chessRouter);

export default router;
