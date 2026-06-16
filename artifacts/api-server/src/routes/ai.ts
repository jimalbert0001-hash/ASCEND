import { Router, type Request, type Response } from 'express';

const router = Router();

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-8b-instruct';

type CoachRole = 'academic' | 'startup' | 'chess' | 'guitar' | 'achievement';

const SYSTEM_PROMPTS: Record<CoachRole, string> = {
  achievement: `You are an Achievement Coach — a sharp, data-driven mentor who helps ambitious students track progress across all life domains (academics, chess, startup, music, habits). You give concise, actionable advice and motivate with honest assessments. Keep responses focused and under 300 words unless a detailed breakdown is explicitly requested.`,
  academic: `You are an Academic Coach specialising in board exam preparation and spaced-repetition study systems. You help students build effective study schedules, identify weak subjects, and optimise revision strategies. Keep responses practical, specific, and under 300 words.`,
  startup: `You are a Startup Coach for student founders. You help with product strategy, GTM, user acquisition, and balancing studies with building. You give blunt, founder-first advice grounded in lean startup principles. Keep responses under 300 words.`,
  chess: `You are a Chess Coach who helps players improve their rating through targeted training. You advise on openings, tactics, endgame study, and mental game. Give specific, actionable training recommendations. Keep responses under 300 words.`,
  guitar: `You are a Guitar Coach helping students build technique, overcome plateaus, and design effective practice sessions. Give structured, specific practice advice. Keep responses under 300 words.`,
};

function getSystemPrompt(role: CoachRole, personalityOverride?: string): string {
  const base = SYSTEM_PROMPTS[role] ?? SYSTEM_PROMPTS.achievement;
  if (personalityOverride?.trim()) {
    return `${base}\n\nAdditional personality/style guidance: ${personalityOverride.trim()}`;
  }
  return base;
}

router.get('/ai/status', (_req: Request, res: Response) => {
  const configured = Boolean(process.env.OPENAI_API_KEY);
  res.json({
    provider: 'OpenRouter',
    configured,
    envVar: 'OPENAI_API_KEY',
  });
});

router.post('/ai/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' });
    return;
  }

  const { messages, role, stream, personalityOverride } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    role: CoachRole;
    userId?: string;
    stream?: boolean;
    personalityOverride?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  const systemPrompt = getSystemPrompt(role ?? 'achievement', personalityOverride);

  const payload = {
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: Boolean(stream),
  };

  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app',
        'X-Title': 'Ascend AI Mentor',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => upstream.statusText);
      res.status(upstream.status).json({ error: `OpenRouter error: ${errText}` });
      return;
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let promptTokens = 0;
      let completionTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            if (promptTokens > 0 || completionTokens > 0) {
              res.write(`data: ${JSON.stringify({ usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens } })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
              usage?: { prompt_tokens?: number; completion_tokens?: number };
            };
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
            }
            if (parsed.usage) {
              promptTokens = parsed.usage.prompt_tokens ?? 0;
              completionTokens = parsed.usage.completion_tokens ?? 0;
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const data = await upstream.json() as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const content = data.choices?.[0]?.message?.content ?? '';
      const usage = data.usage
        ? {
            promptTokens: data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completion_tokens ?? 0,
            totalTokens: (data.usage.prompt_tokens ?? 0) + (data.usage.completion_tokens ?? 0),
          }
        : undefined;

      res.json({ content, usage });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: `Failed to reach AI provider: ${message}` });
  }
});

router.post('/ai/recommendations/daily', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' });
    return;
  }

  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app',
        'X-Title': 'Ascend AI Mentor',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.',
          },
          {
            role: 'user',
            content: `Generate 3 daily recommendations as JSON: { "recommendations": [{ "id": string, "domain": string, "title": string, "detail": string, "priority": "high"|"medium"|"low", "type": "action"|"insight"|"warning"|"celebration" }], "morningBriefing": string }`,
          },
        ],
      }),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'AI provider error' });
      return;
    }

    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

router.post('/ai/recommendations/weekly', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' });
    return;
  }

  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app',
        'X-Title': 'Ascend AI Mentor',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.',
          },
          {
            role: 'user',
            content: `Generate 5 weekly recommendations as JSON: { "recommendations": [{ "id": string, "domain": string, "title": string, "detail": string, "priority": "high"|"medium"|"low", "type": "action"|"insight"|"warning"|"celebration" }], "weeklyDigest": string }`,
          },
        ],
      }),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'AI provider error' });
      return;
    }

    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch {
    res.status(500).json({ error: 'Failed to generate weekly recommendations' });
  }
});

router.post('/ai/recommendations/weaknesses', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' });
    return;
  }

  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app',
        'X-Title': 'Ascend AI Mentor',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.',
          },
          {
            role: 'user',
            content: `Identify 3 weaknesses as JSON: { "weaknesses": [{ "domain": string, "weakness": string, "evidence": string, "suggestion": string, "severity": "critical"|"moderate"|"minor" }] }`,
          },
        ],
      }),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'AI provider error' });
      return;
    }

    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch {
    res.status(500).json({ error: 'Failed to detect weaknesses' });
  }
});

router.post('/ai/analyze/goals', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Set OPENAI_API_KEY to enable AI responses' });
    return;
  }

  try {
    const upstream = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL ?? 'https://ascend-ascend.vercel.app',
        'X-Title': 'Ascend AI Mentor',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an achievement coach. Respond ONLY with valid JSON — no markdown, no prose.',
          },
          {
            role: 'user',
            content: `Analyse 3 sample goals as JSON: { "analyses": [{ "goalId": string, "goalTitle": string, "domain": string, "progress": number, "assessment": string, "blockers": string[], "nextSteps": string[], "projectedCompletion": string, "riskLevel": "on-track"|"at-risk"|"off-track" }] }`,
          },
        ],
      }),
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'AI provider error' });
      return;
    }

    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch {
    res.status(500).json({ error: 'Failed to analyse goals' });
  }
});

export default router;
