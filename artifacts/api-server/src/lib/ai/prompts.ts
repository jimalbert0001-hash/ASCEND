import type { CoachRole, UserContext } from './types.js';

const BASE_PERSONA = `You are ASCEND AI — the central intelligence of the ASCEND Personal Achievement Operating System. You are a world-class coach and mentor who specializes in helping high-performing students manage multiple domains simultaneously: Academics (CBSE Class 12 board prep), Startup building, Chess mastery, Guitar learning, and overall life optimization.

Your communication style:
- Concise, direct, and actionable — no fluff
- Evidence-based: reference the user's actual data when you have it
- Motivating but honest — celebrate wins, address weaknesses clearly
- Think like a mentor who has coached top performers, not a generic chatbot
- Use bullet points for lists, be conversational otherwise
- Keep responses focused and under 300 words unless deep analysis is requested`;

const ROLE_PERSONAS: Record<CoachRole, string> = {
  academic: `You are acting as the ACADEMIC COACH role. Your expertise: CBSE Class 12 board exam strategy, spaced repetition, exam psychology, subject prioritization, and study session optimization. You know SM-2 spaced repetition deeply. You help the user maximize their board exam performance while managing time across other domains.`,

  startup: `You are acting as the STARTUP COACH role. Your expertise: early-stage product development, MVP thinking, user acquisition, founder psychology, balancing studies with building, and lean startup methodology. You understand the unique challenge of building while being a student. Think YC-level advice, not generic business platitudes.`,

  chess: `You are acting as the CHESS COACH role. Your expertise: rating improvement systems, tactical pattern recognition, opening theory, endgame technique, and training efficiency. You give specific, actionable chess improvement advice. You understand the difference between what feels productive (playing games) vs what actually improves rating (targeted tactics/analysis).`,

  guitar: `You are acting as the GUITAR COACH role. Your expertise: skill-based practice design, technique breakdown, song learning strategies, BPM progression, chord transitions, and building a consistent practice habit. You give specific practice advice, not vague encouragement.`,

  achievement: `You are acting as the ACHIEVEMENT COACH role. Your expertise: cross-domain performance optimization, habit stacking, streak psychology, goal setting, motivation science, and life systems design. You look at the user's entire life dashboard and identify the highest-leverage moves across all domains.`,
};

function formatContext(context: UserContext, role: CoachRole): string {
  const sections: string[] = [];

  sections.push(`USER: ${context.user.name} | Streak: ${context.user.stats.habitStreak} days | Study Hours Total: ${context.user.stats.studyHours}h | Chess Rating: ${context.user.stats.chessRating}`);

  if (context.goals.length > 0) {
    const domainGoals = role === 'achievement'
      ? context.goals
      : context.goals.filter(g => {
          const domainMap: Record<CoachRole, string[]> = {
            academic: ['academics'],
            startup: ['startup'],
            chess: ['chess'],
            guitar: ['guitar'],
            achievement: ['academics', 'startup', 'chess', 'guitar', 'life'],
          };
          return domainMap[role].includes(g.domain);
        });

    if (domainGoals.length > 0) {
      sections.push('GOALS:\n' + domainGoals.map(g =>
        `• ${g.title} [${g.domain}] — ${g.progress}% complete`
      ).join('\n'));
    }
  }

  const pendingTasks = context.tasks.filter(t => !t.completed);
  if (pendingTasks.length > 0) {
    const relevantTasks = role === 'achievement'
      ? pendingTasks.slice(0, 5)
      : pendingTasks.filter(t => {
          const domainMap: Record<CoachRole, string[]> = {
            academic: ['academics'],
            startup: ['startup'],
            chess: ['chess'],
            guitar: ['guitar'],
            achievement: ['academics', 'startup', 'chess', 'guitar', 'life'],
          };
          return domainMap[role].includes(t.domain);
        }).slice(0, 5);

    if (relevantTasks.length > 0) {
      sections.push('PENDING TASKS:\n' + relevantTasks.map(t =>
        `• [${t.priority.toUpperCase()}] ${t.title} — due ${t.due || 'no date'}`
      ).join('\n'));
    }
  }

  if (role === 'academic' && context.studyData) {
    const d = context.studyData;
    const parts = [`Total study hours: ${d.totalHours}h`];
    if (d.subjectBreakdown?.length) {
      parts.push('Subjects: ' + d.subjectBreakdown.map(s => `${s.name} (${s.hours}h${s.score ? `, ${s.score}%` : ''})`).join(', '));
    }
    if (d.recentTests?.length) {
      parts.push('Recent tests: ' + d.recentTests.map(t => `${t.name}: ${t.score}%`).join(', '));
    }
    if (d.weakChapters?.length) {
      parts.push('Weak chapters: ' + d.weakChapters.join(', '));
    }
    sections.push('ACADEMIC DATA:\n' + parts.join('\n'));
  }

  if (role === 'startup' && context.startupData) {
    const d = context.startupData;
    const parts: string[] = [];
    if (d.projects?.length) {
      parts.push('Projects: ' + d.projects.map(p => `${p.name} (${p.stage}${p.mrr ? `, $${p.mrr} MRR` : ''}${p.users ? `, ${p.users} users` : ''})`).join(', '));
    }
    if (d.topMetrics?.length) {
      parts.push('Metrics: ' + d.topMetrics.map(m => `${m.name}: ${m.value} ${m.unit}`).join(', '));
    }
    if (d.pendingFeatures) {
      parts.push(`Pending features: ${d.pendingFeatures}`);
    }
    if (parts.length) sections.push('STARTUP DATA:\n' + parts.join('\n'));
  }

  if (role === 'chess' && context.chessData) {
    const d = context.chessData;
    const parts = [
      `Current rating: ${d.currentRating} | Goal: ${d.ratingGoal} (gap: ${d.ratingGoal - d.currentRating} points)`,
    ];
    if (d.winRate !== undefined) parts.push(`Win rate: ${d.winRate}%`);
    if (d.tacticsAccuracy !== undefined) parts.push(`Tactics accuracy: ${d.tacticsAccuracy}%`);
    sections.push('CHESS DATA:\n' + parts.join('\n'));
  }

  if (role === 'guitar' && context.guitarData) {
    const d = context.guitarData;
    const parts = [`Total practice: ${d.totalPracticeHours}h`];
    if (d.songsLearning) parts.push(`Songs in progress: ${d.songsLearning}`);
    if (d.songsMastered) parts.push(`Songs mastered: ${d.songsMastered}`);
    if (d.recentFocusAreas?.length) parts.push(`Recent focus: ${d.recentFocusAreas.join(', ')}`);
    if (d.currentBpm) parts.push(`Current target BPM: ${d.currentBpm}`);
    sections.push('GUITAR DATA:\n' + parts.join('\n'));
  }

  if (context.reviews) {
    const r = context.reviews;
    const parts: string[] = [];
    if (r.lastDailyScore !== undefined) parts.push(`Last daily score: ${r.lastDailyScore}/1000`);
    if (r.weeklyAvgScore !== undefined) parts.push(`Weekly avg: ${r.weeklyAvgScore}/1000`);
    if (r.streak !== undefined) parts.push(`Current streak: ${r.streak} days`);
    if (r.recentMood) parts.push(`Recent mood: ${r.recentMood}`);
    if (parts.length) sections.push('REVIEWS:\n' + parts.join('\n'));
  }

  return sections.join('\n\n');
}

export function buildSystemPrompt(role: CoachRole, context: UserContext): string {
  const contextStr = formatContext(context, role);
  return `${BASE_PERSONA}

${ROLE_PERSONAS[role]}

--- USER CONTEXT ---
${contextStr}
--- END CONTEXT ---

Always reference the user's actual data in your responses. Be specific, not generic.`;
}

export function buildRecommendationPrompt(context: UserContext, type: 'daily' | 'weekly'): string {
  const contextStr = formatContext(context, 'achievement');

  if (type === 'daily') {
    return `${BASE_PERSONA}

You are generating a DAILY RECOMMENDATION SET for the user. Analyze their current context and produce exactly 5 prioritized recommendations for today. Each must be specific and actionable.

--- USER CONTEXT ---
${contextStr}
--- END CONTEXT ---

Respond in this exact JSON format (no markdown, pure JSON):
{
  "recommendations": [
    {
      "id": "1",
      "domain": "academics|startup|chess|guitar|life",
      "title": "Short action title (max 8 words)",
      "detail": "Specific reasoning and how-to (2-3 sentences)",
      "priority": "high|medium|low",
      "type": "action|insight|warning|celebration"
    }
  ],
  "morningBriefing": "2-3 sentence energizing summary of what today is about for this user"
}`;
  }

  return `${BASE_PERSONA}

You are generating a WEEKLY RECOMMENDATION SET for the user. Analyze their context deeply and produce exactly 5 strategic recommendations for this week plus a weekly digest.

--- USER CONTEXT ---
${contextStr}
--- END CONTEXT ---

Respond in this exact JSON format (no markdown, pure JSON):
{
  "recommendations": [
    {
      "id": "1",
      "domain": "academics|startup|chess|guitar|life",
      "title": "Short strategic title (max 8 words)",
      "detail": "Specific reasoning and this-week action (2-3 sentences)",
      "priority": "high|medium|low",
      "type": "action|insight|warning|celebration"
    }
  ],
  "weeklyDigest": "3-4 sentence strategic overview of the week's priorities and why"
}`;
}

export function buildWeaknessPrompt(context: UserContext): string {
  const contextStr = formatContext(context, 'achievement');

  return `${BASE_PERSONA}

Analyze the user's data and identify their TOP 3 biggest weaknesses — the gaps that are most limiting their overall progress. Be honest and specific. Reference their actual numbers.

--- USER CONTEXT ---
${contextStr}
--- END CONTEXT ---

Respond in this exact JSON format (no markdown, pure JSON):
{
  "weaknesses": [
    {
      "domain": "academics|startup|chess|guitar|life",
      "weakness": "Short weakness title",
      "evidence": "Specific data point from their profile proving this weakness",
      "suggestion": "Concrete 1-week action to address it",
      "severity": "critical|moderate|minor"
    }
  ]
}`;
}

export function buildGoalAnalysisPrompt(context: UserContext): string {
  const contextStr = formatContext(context, 'achievement');

  return `${BASE_PERSONA}

Perform a deep GOAL ANALYSIS for this user. For each of their goals, assess trajectory, identify blockers, and give next steps.

--- USER CONTEXT ---
${contextStr}
--- END CONTEXT ---

Respond in this exact JSON format (no markdown, pure JSON):
{
  "analyses": [
    {
      "goalId": "goal id",
      "goalTitle": "goal title",
      "domain": "domain",
      "progress": 0,
      "assessment": "2-3 sentence honest assessment of current trajectory",
      "blockers": ["specific blocker 1", "specific blocker 2"],
      "nextSteps": ["concrete next step 1", "concrete next step 2", "concrete next step 3"],
      "projectedCompletion": "e.g. 'On track for July 15' or 'At risk — needs 2x effort'",
      "riskLevel": "on-track|at-risk|off-track"
    }
  ]
}`;
}
