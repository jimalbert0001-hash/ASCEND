import { supabase, isSupabaseConfigured } from './supabase';
import { sampleData } from './sample-data';

export interface FrontendAchievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'skill' | 'meta';
  earned: boolean;
  date?: string;
  domain?: 'academics' | 'startup' | 'chess' | 'guitar' | 'life';
  icon?: string;
}

const isMock = !isSupabaseConfigured;

export async function getAchievements(userId: string): Promise<FrontendAchievement[]> {
  if (isMock) return sampleData.achievements as FrontendAchievement[];
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    if (error) throw error;
    if (!data?.length) return sampleData.achievements as FrontendAchievement[];
    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      earned: !!a.earned_at,
      date: a.earned_at ? a.earned_at.split('T')[0] : undefined,
      domain: a.domain,
      icon: a.icon,
    }));
  } catch { return sampleData.achievements as FrontendAchievement[]; }
}
