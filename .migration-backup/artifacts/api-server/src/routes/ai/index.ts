import { Router } from 'express';
import chatRouter from './chat.js';
import recommendationsRouter from './recommendations.js';
import analysisRouter from './analysis.js';
import { buildContextFromDB } from '../../lib/ai/context.js';

const router = Router();

router.get('/context', async (req, res) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) { res.status(400).json({ error: 'userId is required' }); return; }
  const context = await buildContextFromDB(userId);
  res.json(context);
});

router.use('/', chatRouter);
router.use('/recommendations', recommendationsRouter);
router.use('/analyze', analysisRouter);

export default router;
