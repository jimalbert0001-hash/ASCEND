import { Router } from 'express';
import chatRouter from './chat.js';
import recommendationsRouter from './recommendations.js';
import analysisRouter from './analysis.js';

const router = Router();

router.use('/', chatRouter);
router.use('/recommendations', recommendationsRouter);
router.use('/analyze', analysisRouter);

export default router;
