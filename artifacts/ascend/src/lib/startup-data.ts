// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectStage = 'idea' | 'mvp' | 'growth' | 'scaling';
export type ProjectStatus = 'active' | 'paused' | 'archived';

export type StartupProject = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stage: ProjectStage;
  status: ProjectStatus;
  color: string;
  colorHex: string;
  tags: string[];
  teamSize: number;
  createdAt: string;
  website?: string;
};

export type IdeaStatus = 'raw' | 'refined' | 'validated' | 'dropped';

export type IdeaVaultItem = {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  targetMarket: string;
  status: IdeaStatus;
  rating: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: string;
};

export type RoadmapPhase = 'q1' | 'q2' | 'q3' | 'q4';
export type RoadmapStatus = 'backlog' | 'in_progress' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type RoadmapItem = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  phase: RoadmapPhase;
  status: RoadmapStatus;
  priority: Priority;
  dueDate?: string;
  tags: string[];
};

export type FeatureStatus = 'idea' | 'planned' | 'in_progress' | 'done';
export type Effort = 'xs' | 's' | 'm' | 'l' | 'xl';

export type Feature = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: Priority;
  effort: Effort;
  impact: 'low' | 'medium' | 'high';
  requestedBy?: string;
  votes: number;
  createdAt: string;
};

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'wontfix';

export type BugReport = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  reportedAt: string;
  resolvedAt?: string;
};

export type MilestoneCat = 'product' | 'marketing' | 'legal' | 'technical' | 'growth';
export type MilestoneStatus = 'pending' | 'in_progress' | 'done' | 'skipped';

export type LaunchMilestone = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: MilestoneCat;
  dueDate: string;
  status: MilestoneStatus;
};

export type RevenueEntry = {
  id: string;
  projectId: string;
  month: string;
  mrr: number;
  newRevenue: number;
  churn: number;
};

export type UserMetricEntry = {
  id: string;
  projectId: string;
  month: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
};

// ─── Sample Data ─────────────────────────────────────────────────────────────

const today = new Date();
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
const daysFromNow = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };

export const projectsData: StartupProject[] = [
  {
    id: 'eduflow',
    name: 'EduFlow',
    tagline: 'Personalised learning paths for every student',
    description: 'An adaptive EdTech SaaS platform that builds personalised learning roadmaps using AI, tracks progress in real time, and recommends content gaps. Targeted at Indian Class 9–12 students and coaching centres.',
    stage: 'growth',
    status: 'active',
    color: 'violet',
    colorHex: '#8b5cf6',
    tags: ['EdTech', 'SaaS', 'AI', 'B2C', 'B2B2C'],
    teamSize: 3,
    createdAt: '2025-11-15',
    website: 'eduflow.app',
  },
  {
    id: 'healthpulse',
    name: 'HealthPulse',
    tagline: 'AI-powered health insights in your pocket',
    description: 'Mobile-first health tracker that connects wearable data, diet logs, and mood journals to surface weekly AI insights and anomaly alerts. Targeting urban Indian millennials.',
    stage: 'mvp',
    status: 'active',
    color: 'emerald',
    colorHex: '#10b981',
    tags: ['HealthTech', 'Mobile', 'AI', 'B2C'],
    teamSize: 2,
    createdAt: '2026-01-20',
  },
  {
    id: 'codebuddy',
    name: 'CodeBuddy',
    tagline: 'Your AI pair-programmer for hackathons',
    description: 'Lightweight VS Code extension + web app that helps student developers scaffold projects, debug errors in plain English, and generate boilerplate for 30+ frameworks.',
    stage: 'idea',
    status: 'paused',
    color: 'cyan',
    colorHex: '#06b6d4',
    tags: ['DevTools', 'AI', 'B2D'],
    teamSize: 1,
    createdAt: '2026-04-02',
  },
];

export const ideasData: IdeaVaultItem[] = [
  {
    id: 'idea-1',
    title: 'Campus Gig Marketplace',
    description: 'A platform connecting college students to short micro-gigs (design, tutoring, errands) within the same campus network.',
    problem: 'Students need quick income; other students need cheap, trusted help — but no platform caters specifically to on-campus micro-work.',
    solution: 'Hyperlocal gig marketplace with reputation scores, campus verification, and WhatsApp-first UX.',
    targetMarket: 'Indian college students (18–25), ~38 million enrolled',
    status: 'refined',
    rating: 4,
    tags: ['Marketplace', 'Hyperlocal', 'College'],
    createdAt: daysAgo(45),
  },
  {
    id: 'idea-2',
    title: 'AI Mock Interview Coach',
    description: 'Conversational AI that runs personalised mock interviews for engineering and MBA aspirants, grades answers, and suggests improvements.',
    problem: 'Quality mock interview preparation is expensive and inaccessible for tier-2/3 city students.',
    solution: 'Voice + text AI mock interviews with instant grading, suggested answers, and progress tracking over 30-day sprints.',
    targetMarket: 'Indian competitive exam students (CAT, UPSC, campus placements)',
    status: 'validated',
    rating: 5,
    tags: ['EdTech', 'AI', 'Voice', 'B2C'],
    createdAt: daysAgo(30),
  },
  {
    id: 'idea-3',
    title: 'Founder OS Newsletter',
    description: 'A weekly newsletter + Notion template pack for solo founders and student entrepreneurs — covering GTM tactics, fundraising, and mental health.',
    problem: 'Most founder content is US-centric, paid, or irrelevant to bootstrapped solo founders in India.',
    solution: 'Free newsletter with India context + premium Notion toolkit subscription at ₹299/mo.',
    targetMarket: 'Indian early-stage founders and aspiring entrepreneurs, ~500k on Twitter',
    status: 'raw',
    rating: 3,
    tags: ['Content', 'Newsletter', 'Community'],
    createdAt: daysAgo(12),
  },
  {
    id: 'idea-4',
    title: 'Exam Prep Accountability Groups',
    description: 'Cohort-based accountability pods for competitive exam students — daily check-ins, peer leaderboards, and expert weekly sessions.',
    problem: 'Online exam prep is lonely; motivation drops after week 2; no community aspect in most apps.',
    solution: 'Curated pods of 8 students, daily async standups, weekly group sessions, gamified streaks.',
    targetMarket: 'JEE/NEET aspirants, Class 11-12 students',
    status: 'validated',
    rating: 4,
    tags: ['EdTech', 'Community', 'Accountability'],
    createdAt: daysAgo(20),
  },
  {
    id: 'idea-5',
    title: 'Open Source Dependency Auditor',
    description: 'CLI + dashboard that scans your repo, audits npm/pip dependencies for vulnerabilities, and auto-opens PRs with safe upgrade suggestions.',
    problem: 'Most devs ignore security audits; existing tools are noisy and don\'t auto-fix.',
    solution: 'One-command setup, smart noise filtering, auto-PR with changelog summaries, Slack alerts.',
    targetMarket: 'Individual developers and small engineering teams',
    status: 'raw',
    rating: 3,
    tags: ['DevTools', 'Security', 'Open Source'],
    createdAt: daysAgo(8),
  },
];

export const roadmapData: RoadmapItem[] = [
  { id: 'rm-1', projectId: 'eduflow', title: 'Adaptive quiz engine v1', description: 'Build the core algorithm that adapts question difficulty based on past performance.', phase: 'q1', status: 'done', priority: 'critical', dueDate: '2026-01-31', tags: ['core', 'ai'] },
  { id: 'rm-2', projectId: 'eduflow', title: 'Onboarding flow redesign', description: 'Reduce time-to-value by redesigning the 5-step onboarding into a 2-minute guided setup.', phase: 'q1', status: 'done', priority: 'high', dueDate: '2026-02-15', tags: ['ux'] },
  { id: 'rm-3', projectId: 'eduflow', title: 'Coach/parent portal', description: 'Dashboard for parents and coaching centres to view student progress and flag concerns.', phase: 'q1', status: 'done', priority: 'high', dueDate: '2026-03-01', tags: ['b2b2c'] },
  { id: 'rm-4', projectId: 'eduflow', title: 'Video lesson integration', description: 'Embed short-form video explanations (YouTube + in-house) into the chapter flow.', phase: 'q2', status: 'done', priority: 'medium', dueDate: '2026-04-10', tags: ['content'] },
  { id: 'rm-5', projectId: 'eduflow', title: 'Gamification system', description: 'XP points, badges, streaks, and weekly leaderboards to improve retention.', phase: 'q2', status: 'in_progress', priority: 'high', dueDate: daysFromNow(14), tags: ['engagement'] },
  { id: 'rm-6', projectId: 'eduflow', title: 'Referral & invite system', description: 'Built-in referral links with ₹100 credit per successful invite.', phase: 'q2', status: 'in_progress', priority: 'high', dueDate: daysFromNow(21), tags: ['growth'] },
  { id: 'rm-7', projectId: 'eduflow', title: 'Mobile app (React Native)', description: 'Launch iOS + Android apps to capture mobile-first users.', phase: 'q3', status: 'backlog', priority: 'critical', dueDate: daysFromNow(60), tags: ['mobile'] },
  { id: 'rm-8', projectId: 'eduflow', title: 'Offline mode', description: 'Allow students to download lessons and attempt quizzes without internet — critical for tier-2 cities.', phase: 'q3', status: 'backlog', priority: 'high', dueDate: daysFromNow(75), tags: ['core', 'mobile'] },
  { id: 'rm-9', projectId: 'eduflow', title: 'AI doubt-solver chatbot', description: 'In-context AI chatbot that answers chapter-specific doubts with curriculum-aligned answers.', phase: 'q3', status: 'backlog', priority: 'high', dueDate: daysFromNow(90), tags: ['ai'] },
  { id: 'rm-10', projectId: 'eduflow', title: 'School tie-ups programme', description: 'B2B licensing for schools — bulk seat pricing, admin dashboard, usage reports.', phase: 'q4', status: 'backlog', priority: 'critical', dueDate: daysFromNow(120), tags: ['b2b', 'growth'] },
  { id: 'rm-11', projectId: 'eduflow', title: 'Regional language support', description: 'Hindi, Tamil, and Telugu interfaces + translated content for 3 major states.', phase: 'q4', status: 'backlog', priority: 'high', dueDate: daysFromNow(150), tags: ['localisation'] },
  { id: 'rm-12', projectId: 'eduflow', title: 'Series A fundraising prep', description: 'Pitch deck, data room, and traction metrics compiled for institutional fundraising.', phase: 'q4', status: 'backlog', priority: 'medium', dueDate: daysFromNow(160), tags: ['fundraising'] },
  { id: 'rm-13', projectId: 'healthpulse', title: 'Core wearable sync', description: 'Connect Apple Health, Google Fit, and Fitbit APIs to pull step, sleep, and HRV data.', phase: 'q1', status: 'done', priority: 'critical', dueDate: '2026-03-01', tags: ['core'] },
  { id: 'rm-14', projectId: 'healthpulse', title: 'Weekly AI insight report', description: 'Generate a personalised weekly health report with 3–5 actionable insights.', phase: 'q2', status: 'in_progress', priority: 'high', dueDate: daysFromNow(10), tags: ['ai'] },
  { id: 'rm-15', projectId: 'healthpulse', title: 'Community challenges', description: 'Monthly step challenges and water-intake goals with social sharing.', phase: 'q3', status: 'backlog', priority: 'medium', dueDate: daysFromNow(80), tags: ['social'] },
];

export const featuresData: Feature[] = [
  { id: 'ft-1', projectId: 'eduflow', title: 'Dark mode toggle', description: 'Allow users to switch between light and dark themes in settings.', status: 'done', priority: 'low', effort: 'xs', impact: 'medium', votes: 47, createdAt: daysAgo(60) },
  { id: 'ft-2', projectId: 'eduflow', title: 'Progress export (PDF)', description: 'Export personal progress report as a shareable PDF for parents and teachers.', status: 'done', priority: 'medium', effort: 's', impact: 'high', requestedBy: 'User feedback', votes: 132, createdAt: daysAgo(55) },
  { id: 'ft-3', projectId: 'eduflow', title: 'Study timer with Pomodoro', description: 'Built-in focus timer with Pomodoro presets and chapter-linked session logging.', status: 'in_progress', priority: 'high', effort: 'm', impact: 'high', votes: 89, createdAt: daysAgo(30) },
  { id: 'ft-4', projectId: 'eduflow', title: 'Collaborative study rooms', description: 'Real-time shared study rooms where 2–8 students work together with a shared timer.', status: 'planned', priority: 'high', effort: 'xl', impact: 'high', requestedBy: 'Top 10 power users', votes: 214, createdAt: daysAgo(20) },
  { id: 'ft-5', projectId: 'eduflow', title: 'AI flashcard generator', description: 'Auto-generate Anki-style flashcards from chapter notes using LLM summarization.', status: 'planned', priority: 'critical', effort: 'l', impact: 'high', votes: 356, createdAt: daysAgo(15) },
  { id: 'ft-6', projectId: 'eduflow', title: 'Parent weekly email digest', description: 'Automated weekly email to parents summarising their child\'s activity and top achievements.', status: 'idea', priority: 'medium', effort: 's', impact: 'medium', requestedBy: 'Parent survey', votes: 28, createdAt: daysAgo(7) },
  { id: 'ft-7', projectId: 'healthpulse', title: 'Meal logging with barcode scan', description: 'Scan food barcodes to auto-populate nutritional data into daily food log.', status: 'in_progress', priority: 'high', effort: 'l', impact: 'high', votes: 91, createdAt: daysAgo(25) },
  { id: 'ft-8', projectId: 'healthpulse', title: 'Symptom diary', description: 'Log daily symptoms, triggers, and mood to help identify patterns over time.', status: 'planned', priority: 'medium', effort: 'm', impact: 'medium', votes: 44, createdAt: daysAgo(14) },
];

export const bugsData: BugReport[] = [
  { id: 'bug-1', projectId: 'eduflow', title: 'Quiz score not saving on slow connections', description: 'When a quiz is submitted on a ≤2G connection, the score is lost and shows 0% instead of the actual result.', severity: 'critical', status: 'in_progress', reportedAt: daysAgo(5) },
  { id: 'bug-2', projectId: 'eduflow', title: 'Chapter progress resets after password change', description: 'A handful of users report chapter completion state being cleared after a password reset flow.', severity: 'high', status: 'open', reportedAt: daysAgo(8) },
  { id: 'bug-3', projectId: 'eduflow', title: 'Video player crashes on iOS Safari', description: 'Embedded video lessons throw a "media not supported" error on iOS 15 Safari. Likely MIME type issue.', severity: 'high', status: 'in_progress', reportedAt: daysAgo(3) },
  { id: 'bug-4', projectId: 'eduflow', title: 'Leaderboard shows duplicate names', description: 'When a student changes their display name, both old and new names appear on the weekly leaderboard.', severity: 'medium', status: 'resolved', reportedAt: daysAgo(14), resolvedAt: daysAgo(10) },
  { id: 'bug-5', projectId: 'eduflow', title: 'Email verification link expires too quickly', description: 'New signups report the verification link (sent via Supabase) expiring within 10 minutes. Should be 24h.', severity: 'medium', status: 'resolved', reportedAt: daysAgo(20), resolvedAt: daysAgo(18) },
  { id: 'bug-6', projectId: 'eduflow', title: 'Notification badge count wrong on reload', description: 'The unread notification count in the header resets to 0 on page reload even when unread notifications exist.', severity: 'low', status: 'open', reportedAt: daysAgo(2) },
  { id: 'bug-7', projectId: 'healthpulse', title: 'Steps data duplicated from Google Fit', description: 'Steps are being imported twice when both Google Fit and the native Health API are connected simultaneously.', severity: 'high', status: 'open', reportedAt: daysAgo(4) },
  { id: 'bug-8', projectId: 'healthpulse', title: 'Insight report empty for new users (first 7 days)', description: 'New users see an empty weekly report before they have 7 days of data — should show a "collecting data" message.', severity: 'low', status: 'resolved', reportedAt: daysAgo(12), resolvedAt: daysAgo(9) },
];

export const milestonesData: LaunchMilestone[] = [
  { id: 'ms-1', projectId: 'eduflow', title: 'MVP live (invite-only beta)', description: 'Core quiz + lesson flow deployed to 50 beta testers.', category: 'product', dueDate: '2025-12-01', status: 'done' },
  { id: 'ms-2', projectId: 'eduflow', title: 'First 100 paying users', description: 'Reach 100 active subscribers via school outreach and referrals.', category: 'growth', dueDate: '2026-01-31', status: 'done' },
  { id: 'ms-3', projectId: 'eduflow', title: 'Privacy policy & T&C published', description: 'Legal review and publishing of all compliance docs for DPDP Act.', category: 'legal', dueDate: '2026-02-15', status: 'done' },
  { id: 'ms-4', projectId: 'eduflow', title: 'Razorpay payment integration', description: 'Accept UPI, cards, and net banking for ₹299/mo subscriptions.', category: 'technical', dueDate: '2026-02-28', status: 'done' },
  { id: 'ms-5', projectId: 'eduflow', title: 'Product Hunt launch', description: 'Coordinated launch day on Product Hunt targeting top-5 of the day.', category: 'marketing', dueDate: daysFromNow(21), status: 'in_progress' },
  { id: 'ms-6', projectId: 'eduflow', title: '₹10L ARR milestone', description: 'Reach ₹10 lakh annual recurring revenue — approximately 280 active subscribers.', category: 'growth', dueDate: daysFromNow(45), status: 'pending' },
  { id: 'ms-7', projectId: 'eduflow', title: 'Mobile app launch (iOS + Android)', description: 'Submit React Native app to App Store and Play Store.', category: 'product', dueDate: daysFromNow(90), status: 'pending' },
  { id: 'ms-8', projectId: 'eduflow', title: 'Series A pitch deck ready', description: 'Data-backed deck with 12-month traction metrics and 18-month projection.', category: 'marketing', dueDate: daysFromNow(150), status: 'pending' },
];

export const revenueData: RevenueEntry[] = [
  { id: 'rev-1', projectId: 'eduflow', month: '2026-01', mrr: 1850, newRevenue: 1850, churn: 0 },
  { id: 'rev-2', projectId: 'eduflow', month: '2026-02', mrr: 2460, newRevenue: 820, churn: 210 },
  { id: 'rev-3', projectId: 'eduflow', month: '2026-03', mrr: 3720, newRevenue: 1480, churn: 220 },
  { id: 'rev-4', projectId: 'eduflow', month: '2026-04', mrr: 5340, newRevenue: 1880, churn: 260 },
  { id: 'rev-5', projectId: 'eduflow', month: '2026-05', mrr: 7240, newRevenue: 2180, churn: 280 },
  { id: 'rev-6', projectId: 'eduflow', month: '2026-06', mrr: 8920, newRevenue: 2010, churn: 330 },
  { id: 'rev-7', projectId: 'healthpulse', month: '2026-02', mrr: 420, newRevenue: 420, churn: 0 },
  { id: 'rev-8', projectId: 'healthpulse', month: '2026-03', mrr: 740, newRevenue: 380, churn: 60 },
  { id: 'rev-9', projectId: 'healthpulse', month: '2026-04', mrr: 990, newRevenue: 310, churn: 60 },
  { id: 'rev-10', projectId: 'healthpulse', month: '2026-05', mrr: 1080, newRevenue: 190, churn: 100 },
  { id: 'rev-11', projectId: 'healthpulse', month: '2026-06', mrr: 1240, newRevenue: 240, churn: 80 },
];

export const userMetricsData: UserMetricEntry[] = [
  { id: 'um-1', projectId: 'eduflow', month: '2026-01', totalUsers: 524, activeUsers: 287, newUsers: 524, churnedUsers: 0 },
  { id: 'um-2', projectId: 'eduflow', month: '2026-02', totalUsers: 712, activeUsers: 398, newUsers: 226, churnedUsers: 38 },
  { id: 'um-3', projectId: 'eduflow', month: '2026-03', totalUsers: 1024, activeUsers: 567, newUsers: 358, churnedUsers: 46 },
  { id: 'um-4', projectId: 'eduflow', month: '2026-04', totalUsers: 1456, activeUsers: 789, newUsers: 480, churnedUsers: 48 },
  { id: 'um-5', projectId: 'eduflow', month: '2026-05', totalUsers: 2180, activeUsers: 1010, newUsers: 780, churnedUsers: 56 },
  { id: 'um-6', projectId: 'eduflow', month: '2026-06', totalUsers: 2847, activeUsers: 1243, newUsers: 720, churnedUsers: 53 },
  { id: 'um-7', projectId: 'healthpulse', month: '2026-02', totalUsers: 148, activeUsers: 98, newUsers: 148, churnedUsers: 0 },
  { id: 'um-8', projectId: 'healthpulse', month: '2026-03', totalUsers: 256, activeUsers: 162, newUsers: 120, churnedUsers: 12 },
  { id: 'um-9', projectId: 'healthpulse', month: '2026-04', totalUsers: 318, activeUsers: 198, newUsers: 74, churnedUsers: 12 },
  { id: 'um-10', projectId: 'healthpulse', month: '2026-05', totalUsers: 389, activeUsers: 224, newUsers: 84, churnedUsers: 13 },
  { id: 'um-11', projectId: 'healthpulse', month: '2026-06', totalUsers: 456, activeUsers: 261, newUsers: 78, churnedUsers: 11 },
];

// ─── Stats helpers ────────────────────────────────────────────────────────────

export function getProjectStats(projectId: string) {
  const rev = revenueData.filter(r => r.projectId === projectId);
  const users = userMetricsData.filter(u => u.projectId === projectId);
  const latest = users[users.length - 1];
  const latestRev = rev[rev.length - 1];
  const prevRev = rev[rev.length - 2];
  const prevUsers = users[users.length - 2];

  const totalUsers = latest?.totalUsers ?? 0;
  const activeUsers = latest?.activeUsers ?? 0;
  const mrr = latestRev?.mrr ?? 0;
  const mrrGrowth = prevRev ? Math.round(((mrr - prevRev.mrr) / prevRev.mrr) * 100) : 0;
  const userGrowth = prevUsers ? Math.round(((totalUsers - prevUsers.totalUsers) / prevUsers.totalUsers) * 100) : 0;
  const retention = latest ? Math.round((1 - latest.churnedUsers / Math.max(1, latest.totalUsers - latest.newUsers)) * 100) : 0;
  const conversion = totalUsers > 0 ? parseFloat(((mrr / 299 / totalUsers) * 100).toFixed(1)) : 0;

  return { totalUsers, activeUsers, mrr, mrrGrowth, userGrowth, retention, conversion };
}

export function getOverallStats() {
  const activeProjects = projectsData.filter(p => p.status === 'active').length;
  const totalUsers = projectsData.reduce((sum, p) => {
    const u = userMetricsData.filter(m => m.projectId === p.id);
    return sum + (u[u.length - 1]?.totalUsers ?? 0);
  }, 0);
  const totalMrr = projectsData.reduce((sum, p) => {
    const r = revenueData.filter(m => m.projectId === p.id);
    return sum + (r[r.length - 1]?.mrr ?? 0);
  }, 0);
  const openBugs = bugsData.filter(b => b.status === 'open' || b.status === 'in_progress').length;
  const ideasCount = ideasData.length;
  return { activeProjects, totalUsers, totalMrr, openBugs, ideasCount };
}

export const PHASE_LABELS: Record<RoadmapPhase, string> = { q1: 'Q1 — Plan', q2: 'Q2 — Build', q3: 'Q3 — Launch', q4: 'Q4 — Scale' };
export const STAGE_LABELS: Record<ProjectStage, string> = { idea: 'Idea', mvp: 'MVP', growth: 'Growth', scaling: 'Scaling' };
export const STATUS_COLORS: Record<string, string> = {
  backlog: 'text-muted-foreground bg-muted/30',
  in_progress: 'text-amber-400 bg-amber-500/10',
  done: 'text-emerald-400 bg-emerald-500/10',
  cancelled: 'text-red-400 bg-red-500/10',
  open: 'text-red-400 bg-red-500/10',
  resolved: 'text-emerald-400 bg-emerald-500/10',
  wontfix: 'text-muted-foreground bg-muted/30',
};
export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-sky-400 bg-sky-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  critical: 'text-red-400 bg-red-500/10',
};
export const SEVERITY_COLORS: Record<BugSeverity, string> = {
  low: 'text-sky-400 bg-sky-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  critical: 'text-red-500 bg-red-500/15 border border-red-500/20',
};
export const STAGE_COLOR: Record<ProjectStage, string> = {
  idea: 'bg-muted/40 text-muted-foreground',
  mvp: 'bg-amber-500/10 text-amber-400',
  growth: 'bg-emerald-500/10 text-emerald-400',
  scaling: 'bg-violet-500/10 text-violet-400',
};

export const MILESTONE_CAT_COLORS: Record<MilestoneCat, string> = {
  product: 'text-violet-400 bg-violet-500/10',
  marketing: 'text-pink-400 bg-pink-500/10',
  legal: 'text-sky-400 bg-sky-500/10',
  technical: 'text-cyan-400 bg-cyan-500/10',
  growth: 'text-emerald-400 bg-emerald-500/10',
};
