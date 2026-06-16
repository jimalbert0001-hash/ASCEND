import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import aiRouter from "./ai.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(aiRouter);

export default router;
