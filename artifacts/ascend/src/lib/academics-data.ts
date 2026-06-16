import { isDataCleared } from "@/lib/data-cleared";

export type Formula = {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  memorized: boolean;
};

export type Chapter = {
  id: string;
  subjectId: string;
  name: string;
  chapterNumber: number;
  isCompleted: boolean;
  understandingLevel: 1 | 2 | 3 | 4 | 5;
  estimatedHours: number;
  actualHours: number;
  lastStudied: string | null;
  revisionCount: number;
  nextRevision: string | null;
  formulas: Formula[];
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  color: string;
  colorHex: string;
  icon: string;
  targetMarks: number;
  chapters: Chapter[];
};

export type StudySession = {
  id: string;
  subjectId: string;
  chapterId: string | null;
  date: string;
  durationMins: number;
  sessionType: 'study' | 'revision' | 'mock_prep';
  focusScore: 1 | 2 | 3 | 4 | 5;
  notes: string;
};

export type MockTest = {
  id: string;
  subjectId: string | null;
  name: string;
  date: string;
  totalMarks: number;
  obtainedMarks: number;
  timeTakenMins: number;
  weakTopics: string[];
  notes: string;
};

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const blankChapter = (id: string, subjectId: string, name: string, num: number): Chapter => ({
  id, subjectId, name, chapterNumber: num,
  isCompleted: false, understandingLevel: 1, estimatedHours: 0,
  actualHours: 0, lastStudied: null, revisionCount: 0, nextRevision: null, formulas: [],
});

export const subjectsData: Subject[] = [
  {
    id: 'phy',
    name: 'Physics',
    code: 'PHY042',
    color: 'blue',
    colorHex: '#3b82f6',
    icon: 'Atom',
    targetMarks: 95,
    chapters: [
      blankChapter('phy-1',  'phy', 'Electric Charges & Fields', 1),
      blankChapter('phy-2',  'phy', 'Electrostatic Potential & Capacitance', 2),
      blankChapter('phy-3',  'phy', 'Current Electricity', 3),
      blankChapter('phy-4',  'phy', 'Moving Charges & Magnetism', 4),
      blankChapter('phy-5',  'phy', 'Magnetism & Matter', 5),
      blankChapter('phy-6',  'phy', 'Electromagnetic Induction', 6),
      blankChapter('phy-7',  'phy', 'Alternating Current', 7),
      blankChapter('phy-8',  'phy', 'Electromagnetic Waves', 8),
      blankChapter('phy-9',  'phy', 'Ray Optics & Optical Instruments', 9),
      blankChapter('phy-10', 'phy', 'Wave Optics', 10),
      blankChapter('phy-11', 'phy', 'Dual Nature of Radiation & Matter', 11),
      blankChapter('phy-12', 'phy', 'Atoms', 12),
      blankChapter('phy-13', 'phy', 'Nuclei', 13),
      blankChapter('phy-14', 'phy', 'Semiconductor Devices', 14),
      blankChapter('phy-15', 'phy', 'Communication Systems', 15),
    ],
  },
  {
    id: 'chem',
    name: 'Chemistry',
    code: 'CHEM043',
    color: 'purple',
    colorHex: '#a855f7',
    icon: 'FlaskConical',
    targetMarks: 95,
    chapters: [
      blankChapter('chem-1',  'chem', 'Solutions', 1),
      blankChapter('chem-2',  'chem', 'Electrochemistry', 2),
      blankChapter('chem-3',  'chem', 'Chemical Kinetics', 3),
      blankChapter('chem-4',  'chem', 'd & f Block Elements', 4),
      blankChapter('chem-5',  'chem', 'Coordination Compounds', 5),
      blankChapter('chem-6',  'chem', 'Haloalkanes & Haloarenes', 6),
      blankChapter('chem-7',  'chem', 'Alcohols Phenols & Ethers', 7),
      blankChapter('chem-8',  'chem', 'Aldehydes Ketones & Carboxylic Acids', 8),
      blankChapter('chem-9',  'chem', 'Amines', 9),
      blankChapter('chem-10', 'chem', 'Biomolecules', 10),
      blankChapter('chem-11', 'chem', 'Polymers', 11),
      blankChapter('chem-12', 'chem', 'Chemistry in Everyday Life', 12),
      blankChapter('chem-13', 'chem', 'The Solid State', 13),
      blankChapter('chem-14', 'chem', 'Surface Chemistry', 14),
      blankChapter('chem-15', 'chem', 'General Principles of Isolation of Elements', 15),
      blankChapter('chem-16', 'chem', 'P Block Elements', 16),
    ],
  },
  {
    id: 'math',
    name: 'Mathematics',
    code: 'MATH041',
    color: 'cyan',
    colorHex: '#06b6d4',
    icon: 'Calculator',
    targetMarks: 100,
    chapters: [
      blankChapter('math-1',  'math', 'Relations & Functions', 1),
      blankChapter('math-2',  'math', 'Inverse Trigonometric Functions', 2),
      blankChapter('math-3',  'math', 'Matrices', 3),
      blankChapter('math-4',  'math', 'Determinants', 4),
      blankChapter('math-5',  'math', 'Continuity & Differentiability', 5),
      blankChapter('math-6',  'math', 'Application of Derivatives', 6),
      blankChapter('math-7',  'math', 'Integrals', 7),
      blankChapter('math-8',  'math', 'Application of Integrals', 8),
      blankChapter('math-9',  'math', 'Differential Equations', 9),
      blankChapter('math-10', 'math', 'Vector Algebra', 10),
      blankChapter('math-11', 'math', 'Three Dimensional Geometry', 11),
      blankChapter('math-12', 'math', 'Linear Programming', 12),
      blankChapter('math-13', 'math', 'Probability', 13),
    ],
  },
  {
    id: 'eng',
    name: 'English',
    code: 'ENG301',
    color: 'green',
    colorHex: '#22c55e',
    icon: 'Book',
    targetMarks: 90,
    chapters: [
      blankChapter('eng-1', 'eng', 'Flamingo — The Last Lesson', 1),
      blankChapter('eng-2', 'eng', 'Flamingo — Lost Spring', 2),
      blankChapter('eng-3', 'eng', 'Flamingo — Deep Water', 3),
      blankChapter('eng-4', 'eng', 'Flamingo — The Rattrap', 4),
      blankChapter('eng-5', 'eng', 'Flamingo — Indigo', 5),
      blankChapter('eng-6', 'eng', 'Flamingo — Poets & Pancakes', 6),
      blankChapter('eng-7', 'eng', 'Flamingo — The Interview', 7),
      blankChapter('eng-8', 'eng', 'Flamingo — Going Places', 8),
    ],
  },
  {
    id: 'cs',
    name: 'Computer Science',
    code: 'CS083',
    color: 'orange',
    colorHex: '#f97316',
    icon: 'Terminal',
    targetMarks: 98,
    chapters: [
      blankChapter('cs-1',  'cs', 'Computer Networks', 1),
      blankChapter('cs-2',  'cs', 'Database Management', 2),
      blankChapter('cs-3',  'cs', 'SQL', 3),
      blankChapter('cs-4',  'cs', 'Boolean Algebra', 4),
      blankChapter('cs-5',  'cs', 'Computer Hardware', 5),
      blankChapter('cs-6',  'cs', 'Programming in Python — Functions', 6),
      blankChapter('cs-7',  'cs', 'Programming in Python — File Handling', 7),
      blankChapter('cs-8',  'cs', 'Programming in Python — Exception Handling', 8),
      blankChapter('cs-9',  'cs', 'Data Structures', 9),
      blankChapter('cs-10', 'cs', 'Society Law & Ethics', 10),
    ],
  },
];

export const studySessionsData: StudySession[] = [
  { id: 's1', subjectId: 'math', chapterId: 'math-6', date: daysAgo(0), durationMins: 90, sessionType: 'study', focusScore: 5, notes: 'Covered maxima/minima problems' },
  { id: 's2', subjectId: 'phy', chapterId: 'phy-9', date: daysAgo(1), durationMins: 75, sessionType: 'study', focusScore: 4, notes: 'Ray optics — lens systems' },
  { id: 's3', subjectId: 'chem', chapterId: 'chem-11', date: daysAgo(1), durationMins: 60, sessionType: 'study', focusScore: 3, notes: 'Amines classification and reactions' },
  { id: 's4', subjectId: 'phy', chapterId: 'phy-5', date: daysAgo(2), durationMins: 45, sessionType: 'revision', focusScore: 4, notes: 'Quick revision — magnetism matter' },
  { id: 's5', subjectId: 'math', chapterId: 'math-10', date: daysAgo(3), durationMins: 80, sessionType: 'study', focusScore: 4, notes: 'Vector operations — dot/cross product' },
  { id: 's6', subjectId: 'cs', chapterId: 'cs-8', date: daysAgo(3), durationMins: 60, sessionType: 'study', focusScore: 5, notes: 'Networking protocols — TCP/IP' },
  { id: 's7', subjectId: 'phy', chapterId: null, date: daysAgo(4), durationMins: 120, sessionType: 'mock_prep', focusScore: 5, notes: 'Full physics mock paper practice' },
  { id: 's8', subjectId: 'chem', chapterId: 'chem-12', date: daysAgo(5), durationMins: 55, sessionType: 'study', focusScore: 3, notes: 'Biomolecules — carbohydrates, proteins' },
  { id: 's9', subjectId: 'eng', chapterId: 'eng-7', date: daysAgo(6), durationMins: 45, sessionType: 'study', focusScore: 4, notes: 'Letter writing formats revision' },
  { id: 's10', subjectId: 'math', chapterId: 'math-7', date: daysAgo(7), durationMins: 100, sessionType: 'revision', focusScore: 5, notes: 'Integration techniques — IBP, substitution' },
  { id: 's11', subjectId: 'phy', chapterId: 'phy-10', date: daysAgo(8), durationMins: 70, sessionType: 'study', focusScore: 3, notes: 'Wave optics — interference and diffraction' },
  { id: 's12', subjectId: 'cs', chapterId: 'cs-9', date: daysAgo(9), durationMins: 50, sessionType: 'study', focusScore: 3, notes: 'Boolean algebra simplification' },
  { id: 's13', subjectId: 'chem', chapterId: 'chem-3', date: daysAgo(10), durationMins: 65, sessionType: 'revision', focusScore: 5, notes: 'Kinetics — zero/first order reactions' },
  { id: 's14', subjectId: 'math', chapterId: 'math-5', date: daysAgo(12), durationMins: 90, sessionType: 'revision', focusScore: 4, notes: 'Differentiation rules review' },
];

export const mockTestsData: MockTest[] = [
  { id: 'm1', subjectId: 'phy', name: 'Physics Unit Test 1', date: daysAgo(45), totalMarks: 100, obtainedMarks: 72, timeTakenMins: 170, weakTopics: ['Wave Optics', 'Dual Nature'], notes: 'Lost marks on calculation errors in optics' },
  { id: 'm2', subjectId: 'phy', name: 'Physics Unit Test 2', date: daysAgo(28), totalMarks: 100, obtainedMarks: 78, timeTakenMins: 165, weakTopics: ['Semiconductors', 'Communication'], notes: 'Better than last time. Need to cover semiconductors' },
  { id: 'm3', subjectId: 'phy', name: 'Physics Mock 3', date: daysAgo(10), totalMarks: 100, obtainedMarks: 85, timeTakenMins: 160, weakTopics: ['Nuclei'], notes: 'Good improvement. Optics much better now' },
  { id: 'm4', subjectId: 'chem', name: 'Chemistry Unit Test 1', date: daysAgo(40), totalMarks: 100, obtainedMarks: 68, timeTakenMins: 170, weakTopics: ['P-Block', 'Amines', 'Biomolecules'], notes: 'Organic chemistry needs more work' },
  { id: 'm5', subjectId: 'chem', name: 'Chemistry Mock 2', date: daysAgo(18), totalMarks: 100, obtainedMarks: 74, timeTakenMins: 168, weakTopics: ['Biomolecules', 'Polymers'], notes: 'Physical and inorganic improved' },
  { id: 'm6', subjectId: 'math', name: 'Mathematics Unit Test 1', date: daysAgo(35), totalMarks: 100, obtainedMarks: 80, timeTakenMins: 175, weakTopics: ['Probability', 'Linear Programming'], notes: 'Calculus strong. Need to practice 3D geometry more' },
  { id: 'm7', subjectId: 'math', name: 'Mathematics Mock 2', date: daysAgo(14), totalMarks: 100, obtainedMarks: 88, timeTakenMins: 172, weakTopics: ['Probability'], notes: 'Excellent. Vectors improved significantly' },
  { id: 'm8', subjectId: null, name: 'Full Syllabus Mock #1', date: daysAgo(7), totalMarks: 500, obtainedMarks: 347, timeTakenMins: 540, weakTopics: ['Wave Optics', 'Biomolecules', 'Probability', 'Semiconductors'], notes: 'Overall 69.4%. Target is 95%. 25.6% gap to close' },
];

export function getClearedSubjectsData(): Subject[] {
  return subjectsData.map(s => ({
    ...s,
    chapters: s.chapters.map(c => ({
      ...c,
      isCompleted: false,
      understandingLevel: 1,
      actualHours: 0,
      revisionCount: 0,
      nextRevision: null,
      lastStudied: null,
    })),
  }));
}

export function getSubjectStats(subject: Subject) {
  if (isDataCleared()) {
    return { completed: 0, total: subject.chapters.length, completionPct: 0, totalHours: 0, avgUnderstanding: 0, dueRevisions: 0 };
  }
  const completed = subject.chapters.filter(c => c.isCompleted).length;
  const total = subject.chapters.length;
  const completionPct = Math.round((completed / total) * 100);
  const totalHours = subject.chapters.reduce((s, c) => s + c.actualHours, 0);
  const avgUnderstanding = subject.chapters.filter(c => c.isCompleted).reduce((s, c, _, arr) => s + c.understandingLevel / arr.length, 0);
  const dueRevisions = subject.chapters.filter(c => c.nextRevision && new Date(c.nextRevision) <= new Date()).length;
  return { completed, total, completionPct, totalHours, avgUnderstanding, dueRevisions };
}

export function getTotalStats() {
  if (isDataCleared()) {
    const boardDate = new Date('2027-03-01');
    const daysUntilBoards = Math.ceil((boardDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { totalHours: 0, avgCompletion: 0, avgMockScore: 0, predictedScore: 0, daysUntilBoards, dueRevisions: 0 };
  }
  const allSubjectStats = subjectsData.map(s => getSubjectStats(s));
  const totalHours = allSubjectStats.reduce((s, x) => s + x.totalHours, 0);
  const avgCompletion = Math.round(allSubjectStats.reduce((s, x) => s + x.completionPct, 0) / subjectsData.length);
  const avgMockScore = mockTestsData.filter(t => t.subjectId !== null).reduce((s, t, _, arr) => s + (t.obtainedMarks / t.totalMarks * 100) / arr.length, 0);
  const predictedScore = Math.round(avgCompletion * 0.5 + avgMockScore * 0.5);
  const boardDate = new Date('2027-03-01');
  const daysUntilBoards = Math.ceil((boardDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const dueRevisions = subjectsData.reduce((s, sub) => s + sub.chapters.filter(c => c.nextRevision && new Date(c.nextRevision) <= new Date()).length, 0);
  return { totalHours: Math.round(totalHours * 10) / 10, avgCompletion, avgMockScore: Math.round(avgMockScore * 10) / 10, predictedScore, daysUntilBoards, dueRevisions };
}
