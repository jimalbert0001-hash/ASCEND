import { Router } from 'express';
import { getAIProvider, getProviderStatus } from '../../lib/ai/factory.js';
import { buildSystemPrompt } from '../../lib/ai/prompts.js';
import { buildContextFromDB } from '../../lib/ai/context.js';
import type { ChatRequest, UserContext } from '../../lib/ai/types.js';
import { logger } from '../../lib/logger.js';

const router = Router();

router.get('/status', (_req, res) => {
  const status = getProviderStatus();
  res.json(status);
});

router.post('/chat', async (req, res) => {
  const { messages, role, userId, context: clientContext, stream = false } = req.body as ChatRequest & { userId?: string; context?: UserContext };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }
  if (!role) {
    res.status(400).json({ error: 'role is required' });
    return;
  }

  const provider = getAIProvider();
  if (!provider.isConfigured) {
    const status = getProviderStatus();
    res.status(503).json({
      error: `AI provider "${status.provider}" is not configured. Set the ${status.envVar} environment variable.`,
      provider: status.provider,
      envVar: status.envVar,
    });
    return;
  }

  let context: UserContext;
  if (userId) {
    context = await buildContextFromDB(userId);
  } else if (clientContext) {
    context = clientContext;
  } else {
    res.status(400).json({ error: 'userId or context is required' });
    return;
  }

  const systemPrompt = buildSystemPrompt(role, context);
  const allMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages];

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      await provider.streamChat(allMessages, {}, (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      logger.error(err, 'AI stream error');
      res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      res.end();
    }
    return;
  }

  try {
    const content = await provider.chat(allMessages);
    res.json({ content, provider: provider.name });
  } catch (err) {
    logger.error(err, 'AI chat error');
    res.status(500).json({ error: 'AI request failed', detail: String(err) });
  }
});

export default router;
