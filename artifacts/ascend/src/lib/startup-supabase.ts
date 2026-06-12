import { supabase } from './supabase';
import {
  projectsData, ideasData, roadmapData, featuresData, bugsData, milestonesData, revenueData, userMetricsData,
  StartupProject, IdeaVaultItem, RoadmapItem, Feature, BugReport, LaunchMilestone, RevenueEntry, UserMetricEntry,
} from './startup-data';

const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<StartupProject[]> {
  if (isMock) return projectsData;
  try {
    const { data, error } = await supabase.from('startup_projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as StartupProject[]) ?? projectsData;
  } catch { return projectsData; }
}

export async function createProject(p: Omit<StartupProject, 'id'>): Promise<StartupProject> {
  const newP: StartupProject = { ...p, id: crypto.randomUUID() };
  if (isMock) return newP;
  try {
    const { data, error } = await supabase.from('startup_projects').insert({ ...p, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as StartupProject;
  } catch { return newP; }
}

export async function updateProject(id: string, updates: Partial<StartupProject>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_projects').update(updates).eq('id', id); } catch { }
}

export async function deleteProject(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_projects').delete().eq('id', id); } catch { }
}

// ─── Ideas ────────────────────────────────────────────────────────────────────

export async function getIdeas(): Promise<IdeaVaultItem[]> {
  if (isMock) return ideasData;
  try {
    const { data, error } = await supabase.from('startup_ideas').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as IdeaVaultItem[]) ?? ideasData;
  } catch { return ideasData; }
}

export async function createIdea(idea: Omit<IdeaVaultItem, 'id'>): Promise<IdeaVaultItem> {
  const newIdea: IdeaVaultItem = { ...idea, id: crypto.randomUUID() };
  if (isMock) return newIdea;
  try {
    const { data, error } = await supabase.from('startup_ideas').insert({ ...idea, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
    if (error) throw error;
    return data as IdeaVaultItem;
  } catch { return newIdea; }
}

export async function updateIdea(id: string, updates: Partial<IdeaVaultItem>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_ideas').update(updates).eq('id', id); } catch { }
}

export async function deleteIdea(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_ideas').delete().eq('id', id); } catch { }
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export async function getRoadmapItems(projectId: string): Promise<RoadmapItem[]> {
  if (isMock) return roadmapData.filter(r => r.projectId === projectId);
  try {
    const { data, error } = await supabase.from('startup_roadmap').select('*').eq('project_id', projectId);
    if (error) throw error;
    return (data as RoadmapItem[]) ?? roadmapData.filter(r => r.projectId === projectId);
  } catch { return roadmapData.filter(r => r.projectId === projectId); }
}

export async function createRoadmapItem(item: Omit<RoadmapItem, 'id'>): Promise<RoadmapItem> {
  const newItem: RoadmapItem = { ...item, id: crypto.randomUUID() };
  if (isMock) return newItem;
  try {
    const { data, error } = await supabase.from('startup_roadmap').insert(item).select().single();
    if (error) throw error;
    return data as RoadmapItem;
  } catch { return newItem; }
}

export async function updateRoadmapItem(id: string, updates: Partial<RoadmapItem>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_roadmap').update(updates).eq('id', id); } catch { }
}

export async function deleteRoadmapItem(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_roadmap').delete().eq('id', id); } catch { }
}

// ─── Features ─────────────────────────────────────────────────────────────────

export async function getFeatures(projectId: string): Promise<Feature[]> {
  if (isMock) return featuresData.filter(f => f.projectId === projectId);
  try {
    const { data, error } = await supabase.from('startup_features').select('*').eq('project_id', projectId);
    if (error) throw error;
    return (data as Feature[]) ?? featuresData.filter(f => f.projectId === projectId);
  } catch { return featuresData.filter(f => f.projectId === projectId); }
}

export async function createFeature(feat: Omit<Feature, 'id'>): Promise<Feature> {
  const newFeat: Feature = { ...feat, id: crypto.randomUUID() };
  if (isMock) return newFeat;
  try {
    const { data, error } = await supabase.from('startup_features').insert(feat).select().single();
    if (error) throw error;
    return data as Feature;
  } catch { return newFeat; }
}

export async function updateFeature(id: string, updates: Partial<Feature>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_features').update(updates).eq('id', id); } catch { }
}

export async function deleteFeature(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_features').delete().eq('id', id); } catch { }
}

// ─── Bugs ─────────────────────────────────────────────────────────────────────

export async function getBugs(projectId: string): Promise<BugReport[]> {
  if (isMock) return bugsData.filter(b => b.projectId === projectId);
  try {
    const { data, error } = await supabase.from('startup_bugs').select('*').eq('project_id', projectId);
    if (error) throw error;
    return (data as BugReport[]) ?? bugsData.filter(b => b.projectId === projectId);
  } catch { return bugsData.filter(b => b.projectId === projectId); }
}

export async function createBug(bug: Omit<BugReport, 'id'>): Promise<BugReport> {
  const newBug: BugReport = { ...bug, id: crypto.randomUUID() };
  if (isMock) return newBug;
  try {
    const { data, error } = await supabase.from('startup_bugs').insert(bug).select().single();
    if (error) throw error;
    return data as BugReport;
  } catch { return newBug; }
}

export async function updateBug(id: string, updates: Partial<BugReport>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_bugs').update(updates).eq('id', id); } catch { }
}

export async function deleteBug(id: string): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_bugs').delete().eq('id', id); } catch { }
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function getMilestones(projectId: string): Promise<LaunchMilestone[]> {
  if (isMock) return milestonesData.filter(m => m.projectId === projectId);
  try {
    const { data, error } = await supabase.from('startup_milestones').select('*').eq('project_id', projectId);
    if (error) throw error;
    return (data as LaunchMilestone[]) ?? milestonesData.filter(m => m.projectId === projectId);
  } catch { return milestonesData.filter(m => m.projectId === projectId); }
}

export async function createMilestone(m: Omit<LaunchMilestone, 'id'>): Promise<LaunchMilestone> {
  const newM: LaunchMilestone = { ...m, id: crypto.randomUUID() };
  if (isMock) return newM;
  try {
    const { data, error } = await supabase.from('startup_milestones').insert(m).select().single();
    if (error) throw error;
    return data as LaunchMilestone;
  } catch { return newM; }
}

export async function updateMilestone(id: string, updates: Partial<LaunchMilestone>): Promise<void> {
  if (isMock) return;
  try { await supabase.from('startup_milestones').update(updates).eq('id', id); } catch { }
}

// ─── Revenue & User Metrics ───────────────────────────────────────────────────

export async function getRevenueEntries(projectId: string): Promise<RevenueEntry[]> {
  if (isMock) return revenueData.filter(r => r.projectId === projectId);
  try {
    const { data, error } = await supabase.from('startup_revenue').select('*').eq('project_id', projectId).order('month', { ascending: true });
    if (error) throw error;
    return (data as RevenueEntry[]) ?? revenueData.filter(r => r.projectId === projectId);
  } catch { return revenueData.filter(r => r.projectId === projectId); }
}

export async function getUserMetrics(projectId: string): Promise<UserMetricEntry[]> {
  if (isMock) return userMetricsData.filter(u => u.projectId === projectId);
  try {
    const { data, error } = await supabase.from('startup_user_metrics').select('*').eq('project_id', projectId).order('month', { ascending: true });
    if (error) throw error;
    return (data as UserMetricEntry[]) ?? userMetricsData.filter(u => u.projectId === projectId);
  } catch { return userMetricsData.filter(u => u.projectId === projectId); }
}
