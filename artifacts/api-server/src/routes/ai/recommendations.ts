import { Router } from 'express';
import { getAIProvider } from '../../lib/ai/factory.js';
import {
  buildRecommendationPrompt,
  buildWeaknessPrompt,
} from '../../lib/ai/prompts.js';
import type { UserContext } from '../../lib/ai/types.js';
import { logger } from '../../lib/logger.js';

const router = Router();

async function runJSON<T>(
  systemPrompt: string,
  fallback: T
): Promise<T> {
  const provider = getAIProvider();
  if (!provider.isConfigured) {
    throw new Error('AI provider not configured');
  }

  const raw = await provider.chat([
    { role: 'user', content: systemPrompt },
  ]);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  return JSON.parse(jsonMatch[0]) as T;
}

router.post('/daily', async (req, res) => {
  const { context } = req.body as { context: UserContext };
  if (!context) {
    res.status(400).json({ error: 'context is required' });
    return;
  }

  try {
    const prompt = buildRecommendationPrompt(context, 'daily');
    const result = await runJSON(prompt, { recommendations: [], morningBriefing: '' });
    res.json(result);
  } catch (err) {
    logger.error(err, 'Daily recommendations error');
    res.status(500).json({ error: 'Failed to generate recommendations', detail: String(err) });
  }
});

router.post('/weekly', async (req, res) => {
  const { context } = req.body as { context: UserContext };
  if (!context) {
    res.status(400).json({ error: 'context is required' });
    return;
  }

  try {
    const prompt = buildRecommendationPrompt(context, 'weekly');
    const result = await runJSON(prompt, { recommendations: [], weeklyDigest: '' });
    res.json(result);
  } catch (err) {
    logger.error(err, 'Weekly recommendations error');
    res.status(500).json({ error: 'Failed to generate recommendations', detail: String(err) });
  }
});

router.post('/weaknesses', async (req, res) => {
  const { context } = req.body as { context: UserContext };
  if (!context) {
    res.status(400).json({ error: 'context is required' });
    return;
  }

  try {
    const prompt = buildWeaknessPrompt(context);
    const result = await runJSON(prompt, { weaknesses: [] });
    res.json(result);
  } catch (err) {
    logger.error(err, 'Weakness detection error');
    res.status(500).json({ error: 'Failed to detect weaknesses', detail: String(err) });
  }
});

export default router;
