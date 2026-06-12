import { supabase } from './supabase';
import { subjectsData, studySessionsData, mockTestsData, Subject, Chapter, StudySession, MockTest } from './academics-data';

const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';

export async function getSubjects(userId: string): Promise<Subject[]> {
  if (isMock) return subjectsData;
  try {
    const { data, error } = await supabase.from('subjects').select('*, chapters(*, revisions(*))').eq('user_id', userId);
    if (error) throw error;
    return data as Subject[] ?? subjectsData;
  } catch { return subjectsData; }
}

export async function updateChapterCompletion(chapterId: string, isCompleted: boolean, level: number): Promise<void> {
  if (isMock) return;
  try {
    await supabase.from('chapters').update({ is_completed: isCompleted, understanding_level: level, completed_at: isCompleted ? new Date().toISOString() : null }).eq('id', chapterId);
  } catch { }
}

export async function updateUnderstandingLevel(chapterId: string, level: number): Promise<void> {
  if (isMock) return;
  try {
    await supabase.from('chapters').update({ understanding_level: level }).eq('id', chapterId);
  } catch { }
}

export async function createStudySession(session: Omit<StudySession, 'id'>): Promise<StudySession> {
  const newSession: StudySession = { ...session, id: crypto.randomUUID() };
  if (isMock) return newSession;
  try {
    const { data, error } = await supabase.from('study_sessions').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      subject_id: session.subjectId,
      chapter_id: session.chapterId,
      started_at: new Date(new Date().getTime() - session.durationMins * 60000).toISOString(),
      ended_at: new Date().toISOString(),
      duration_mins: session.durationMins,
      session_type: session.sessionType,
      focus_score: session.focusScore,
      notes: session.notes,
    }).select().single();
    if (error) throw error;
    return data as StudySession;
  } catch { return newSession; }
}

export async function getStudySessions(userId: string, limit = 20): Promise<StudySession[]> {
  if (isMock) return studySessionsData.slice(0, limit);
  try {
    const { data, error } = await supabase.from('study_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data as StudySession[]) ?? studySessionsData.slice(0, limit);
  } catch { return studySessionsData.slice(0, limit); }
}

export async function createMockTest(test: Omit<MockTest, 'id'>): Promise<MockTest> {
  const newTest: MockTest = { ...test, id: crypto.randomUUID() };
  if (isMock) return newTest;
  try {
    const { data, error } = await supabase.from('mock_tests').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      subject_id: test.subjectId,
      name: test.name,
      test_date: test.date,
      total_marks: test.totalMarks,
      obtained_marks: test.obtainedMarks,
      time_taken_mins: test.timeTakenMins,
      weak_chapters: test.weakTopics,
      notes: test.notes,
    }).select().single();
    if (error) throw error;
    return data as MockTest;
  } catch { return newTest; }
}

export async function getMockTests(userId: string): Promise<MockTest[]> {
  if (isMock) return mockTestsData;
  try {
    const { data, error } = await supabase.from('mock_tests').select('*').eq('user_id', userId).order('test_date', { ascending: false });
    if (error) throw error;
    return (data as MockTest[]) ?? mockTestsData;
  } catch { return mockTestsData; }
}

export async function updateMockTest(id: string, updates: Partial<MockTest>): Promise<void> {
  if (isMock) return;
  try {
    await supabase.from('mock_tests').update({
      obtained_marks: updates.obtainedMarks,
      notes: updates.notes,
      weak_chapters: updates.weakTopics,
    }).eq('id', id);
  } catch { }
}

export async function deleteMockTest(id: string): Promise<void> {
  if (isMock) return;
  try {
    await supabase.from('mock_tests').delete().eq('id', id);
  } catch { }
}

export async function toggleFormulaMemorized(formulaId: string, memorized: boolean): Promise<void> {
  if (isMock) return;
  try {
    await supabase.from('formulas').update({ memorized }).eq('id', formulaId);
  } catch { }
}
