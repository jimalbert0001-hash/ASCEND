import { Router } from 'express';
import { getAIProvider } from '../../lib/ai/factory.js';
import { buildGoalAnalysisPrompt } from '../../lib/ai/prompts.js';
import { buildContextFromDB } from '../../lib/ai/context.js';
import type { UserContext } from '../../lib/ai/types.js';
import { logger } from '../../lib/logger.js';

const router = Router();

router.post('/goals', async (req, res) => {
  const { userId, context: clientContext } = req.body as { userId?: string; context?: UserContext };

  let context: UserContext | null = null;
  if (userId) context = await buildContextFromDB(userId);
  else if (clientContext) context = clientContext;

  if (!context) { res.status(400).json({ error: 'userId or context is required' }); return; }

  const provider = getAIProvider();
  if (!provider.isConfigured) { res.status(503).json({ error: 'AI provider not configured' }); return; }

  try {
    const prompt = buildGoalAnalysisPrompt(context);
    const raw = await provider.chat([{ role: 'user', content: prompt }]);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const result = JSON.parse(jsonMatch[0]) as { analyses: unknown[] };
    res.json(result);
  } catch (err) {
    logger.error(err, 'Goal analysis error');
    res.status(500).json({ error: 'Failed to analyze goals', detail: String(err) });
  }
});

export default router;
