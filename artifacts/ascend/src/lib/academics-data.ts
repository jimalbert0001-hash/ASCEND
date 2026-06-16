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
      { id: 'phy-1', subjectId: 'phy', name: 'Electric Charges & Fields', chapterNumber: 1, isCompleted: true, understandingLevel: 5, estimatedHours: 8, actualHours: 9.5, lastStudied: daysAgo(2), revisionCount: 3, nextRevision: daysFromNow(4), formulas: [
        { id: 'f1', chapterId: 'phy-1', title: "Coulomb's Law", content: "F = kq₁q₂/r²", memorized: true },
        { id: 'f2', chapterId: 'phy-1', title: "Electric Field", content: "E = F/q = kq/r²", memorized: true },
        { id: 'f3', chapterId: 'phy-1', title: "Gauss's Law", content: "Φ = q/ε₀", memorized: true },
      ]},
      { id: 'phy-2', subjectId: 'phy', name: 'Electrostatic Potential & Capacitance', chapterNumber: 2, isCompleted: true, understandingLevel: 4, estimatedHours: 9, actualHours: 10, lastStudied: daysAgo(5), revisionCount: 2, nextRevision: daysFromNow(2), formulas: [
        { id: 'f4', chapterId: 'phy-2', title: "Potential due to point charge", content: "V = kq/r", memorized: true },
        { id: 'f5', chapterId: 'phy-2', title: "Capacitance", content: "C = Q/V = ε₀A/d", memorized: true },
        { id: 'f6', chapterId: 'phy-2', title: "Energy stored", content: "U = ½CV² = Q²/2C", memorized: false },
      ]},
      { id: 'phy-3', subjectId: 'phy', name: 'Current Electricity', chapterNumber: 3, isCompleted: true, understandingLevel: 5, estimatedHours: 10, actualHours: 11, lastStudied: daysAgo(3), revisionCount: 4, nextRevision: daysFromNow(7), formulas: [
        { id: 'f7', chapterId: 'phy-3', title: "Ohm's Law", content: "V = IR", memorized: true },
        { id: 'f8', chapterId: 'phy-3', title: "Resistivity", content: "R = ρL/A", memorized: true },
        { id: 'f9', chapterId: 'phy-3', title: "Kirchhoff's Laws", content: "ΣI = 0 (KCL), ΣV = 0 (KVL)", memorized: true },
      ]},
      { id: 'phy-4', subjectId: 'phy', name: 'Moving Charges & Magnetism', chapterNumber: 4, isCompleted: true, understandingLevel: 4, estimatedHours: 9, actualHours: 8.5, lastStudied: daysAgo(8), revisionCount: 2, nextRevision: daysFromNow(1), formulas: [
        { id: 'f10', chapterId: 'phy-4', title: "Biot-Savart Law", content: "dB = μ₀Idl×r̂/4πr²", memorized: true },
        { id: 'f11', chapterId: 'phy-4', title: "Lorentz Force", content: "F = q(v×B)", memorized: true },
      ]},
      { id: 'phy-5', subjectId: 'phy', name: 'Magnetism & Matter', chapterNumber: 5, isCompleted: true, understandingLevel: 3, estimatedHours: 5, actualHours: 5, lastStudied: daysAgo(12), revisionCount: 1, nextRevision: daysFromNow(0), formulas: [
        { id: 'f12', chapterId: 'phy-5', title: "Magnetic Moment", content: "m = NIA", memorized: true },
      ]},
      { id: 'phy-6', subjectId: 'phy', name: 'Electromagnetic Induction', chapterNumber: 6, isCompleted: true, understandingLevel: 5, estimatedHours: 8, actualHours: 9, lastStudied: daysAgo(4), revisionCount: 3, nextRevision: daysFromNow(5), formulas: [
        { id: 'f13', chapterId: 'phy-6', title: "Faraday's Law", content: "EMF = -dΦ/dt", memorized: true },
        { id: 'f14', chapterId: 'phy-6', title: "Lenz's Law", content: "Induced EMF opposes change in flux", memorized: true },
      ]},
      { id: 'phy-7', subjectId: 'phy', name: 'Alternating Current', chapterNumber: 7, isCompleted: true, understandingLevel: 4, estimatedHours: 8, actualHours: 7.5, lastStudied: daysAgo(6), revisionCount: 2, nextRevision: daysFromNow(3), formulas: [
        { id: 'f15', chapterId: 'phy-7', title: "Impedance", content: "Z = √(R² + (XL-XC)²)", memorized: true },
        { id: 'f16', chapterId: 'phy-7', title: "Resonant Frequency", content: "f = 1/(2π√LC)", memorized: false },
      ]},
      { id: 'phy-8', subjectId: 'phy', name: 'Electromagnetic Waves', chapterNumber: 8, isCompleted: true, understandingLevel: 4, estimatedHours: 4, actualHours: 3.5, lastStudied: daysAgo(10), revisionCount: 2, nextRevision: daysFromNow(8), formulas: [
        { id: 'f17', chapterId: 'phy-8', title: "Speed of light", content: "c = 1/√(μ₀ε₀) = 3×10⁸ m/s", memorized: true },
      ]},
      { id: 'phy-9', subjectId: 'phy', name: 'Ray Optics & Optical Instruments', chapterNumber: 9, isCompleted: false, understandingLevel: 3, estimatedHours: 10, actualHours: 6, lastStudied: daysAgo(1), revisionCount: 0, nextRevision: null, formulas: [
        { id: 'f18', chapterId: 'phy-9', title: "Mirror Formula", content: "1/f = 1/v + 1/u", memorized: true },
        { id: 'f19', chapterId: 'phy-9', title: "Lens Maker's Equation", content: "1/f = (n-1)(1/R₁ - 1/R₂)", memorized: false },
      ]},
      { id: 'phy-10', subjectId: 'phy', name: 'Wave Optics', chapterNumber: 10, isCompleted: false, understandingLevel: 2, estimatedHours: 7, actualHours: 3, lastStudied: daysAgo(2), revisionCount: 0, nextRevision: null, formulas: [
        { id: 'f20', chapterId: 'phy-10', title: "Young's Double Slit", content: "β = λD/d", memorized: false },
      ]},
      { id: 'phy-11', subjectId: 'phy', name: 'Dual Nature of Radiation', chapterNumber: 11, isCompleted: false, understandingLevel: 2, estimatedHours: 5, actualHours: 2, lastStudied: daysAgo(3), revisionCount: 0, nextRevision: null, formulas: [
        { id: 'f21', chapterId: 'phy-11', title: "Photoelectric Effect", content: "KE_max = hf - φ", memorized: false },
      ]},
      { id: 'phy-12', subjectId: 'phy', name: 'Atoms', chapterNumber: 12, isCompleted: false, understandingLevel: 3, estimatedHours: 5, actualHours: 3, lastStudied: daysAgo(5), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'phy-13', subjectId: 'phy', name: 'Nuclei', chapterNumber: 13, isCompleted: false, understandingLevel: 2, estimatedHours: 4, actualHours: 1, lastStudied: null, revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'phy-14', subjectId: 'phy', name: 'Semiconductor Devices', chapterNumber: 14, isCompleted: false, understandingLevel: 1, estimatedHours: 7, actualHours: 0, lastStudied: null, revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'phy-15', subjectId: 'phy', name: 'Communication Systems', chapterNumber: 15, isCompleted: false, understandingLevel: 1, estimatedHours: 3, actualHours: 0, lastStudied: null, revisionCount: 0, nextRevision: null, formulas: [] },
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
      { id: 'chem-1', subjectId: 'chem', name: 'Solutions', chapterNumber: 1, isCompleted: true, understandingLevel: 5, estimatedHours: 7, actualHours: 7.5, lastStudied: daysAgo(4), revisionCount: 3, nextRevision: daysFromNow(6), formulas: [
        { id: 'cf1', chapterId: 'chem-1', title: "Raoult's Law", content: "p = p°χ (for ideal solutions)", memorized: true },
        { id: 'cf2', chapterId: 'chem-1', title: "Molarity", content: "M = moles of solute / litres of solution", memorized: true },
      ]},
      { id: 'chem-2', subjectId: 'chem', name: 'Electrochemistry', chapterNumber: 2, isCompleted: true, understandingLevel: 4, estimatedHours: 8, actualHours: 9, lastStudied: daysAgo(6), revisionCount: 2, nextRevision: daysFromNow(2), formulas: [
        { id: 'cf3', chapterId: 'chem-2', title: "Nernst Equation", content: "E = E° - (RT/nF)ln Q", memorized: true },
        { id: 'cf4', chapterId: 'chem-2', title: "Faraday's Law", content: "m = ZIt = (M/nF)It", memorized: true },
      ]},
      { id: 'chem-3', subjectId: 'chem', name: 'Chemical Kinetics', chapterNumber: 3, isCompleted: true, understandingLevel: 5, estimatedHours: 8, actualHours: 8, lastStudied: daysAgo(3), revisionCount: 4, nextRevision: daysFromNow(5), formulas: [
        { id: 'cf5', chapterId: 'chem-3', title: "Rate Law", content: "r = k[A]ᵐ[B]ⁿ", memorized: true },
        { id: 'cf6', chapterId: 'chem-3', title: "Arrhenius Equation", content: "k = Ae^(-Ea/RT)", memorized: true },
      ]},
      { id: 'chem-4', subjectId: 'chem', name: 'Surface Chemistry', chapterNumber: 4, isCompleted: true, understandingLevel: 4, estimatedHours: 5, actualHours: 5, lastStudied: daysAgo(9), revisionCount: 2, nextRevision: daysFromNow(4), formulas: [] },
      { id: 'chem-5', subjectId: 'chem', name: 'P-Block Elements', chapterNumber: 5, isCompleted: true, understandingLevel: 3, estimatedHours: 9, actualHours: 10, lastStudied: daysAgo(7), revisionCount: 2, nextRevision: daysFromNow(1), formulas: [] },
      { id: 'chem-6', subjectId: 'chem', name: 'D & F Block Elements', chapterNumber: 6, isCompleted: true, understandingLevel: 4, estimatedHours: 6, actualHours: 6.5, lastStudied: daysAgo(11), revisionCount: 1, nextRevision: daysFromNow(3), formulas: [] },
      { id: 'chem-7', subjectId: 'chem', name: 'Coordination Compounds', chapterNumber: 7, isCompleted: true, understandingLevel: 5, estimatedHours: 7, actualHours: 7, lastStudied: daysAgo(5), revisionCount: 3, nextRevision: daysFromNow(8), formulas: [] },
      { id: 'chem-8', subjectId: 'chem', name: 'Haloalkanes & Haloarenes', chapterNumber: 8, isCompleted: true, understandingLevel: 4, estimatedHours: 6, actualHours: 7, lastStudied: daysAgo(8), revisionCount: 2, nextRevision: daysFromNow(6), formulas: [] },
      { id: 'chem-9', subjectId: 'chem', name: 'Alcohols, Phenols & Ethers', chapterNumber: 9, isCompleted: true, understandingLevel: 4, estimatedHours: 6, actualHours: 6, lastStudied: daysAgo(10), revisionCount: 1, nextRevision: daysFromNow(4), formulas: [] },
      { id: 'chem-10', subjectId: 'chem', name: 'Aldehydes, Ketones & Carboxylic Acids', chapterNumber: 10, isCompleted: true, understandingLevel: 3, estimatedHours: 8, actualHours: 9, lastStudied: daysAgo(6), revisionCount: 1, nextRevision: daysFromNow(2), formulas: [] },
      { id: 'chem-11', subjectId: 'chem', name: 'Amines', chapterNumber: 11, isCompleted: false, understandingLevel: 3, estimatedHours: 5, actualHours: 3, lastStudied: daysAgo(2), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'chem-12', subjectId: 'chem', name: 'Biomolecules', chapterNumber: 12, isCompleted: false, understandingLevel: 2, estimatedHours: 4, actualHours: 2, lastStudied: daysAgo(4), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'chem-13', subjectId: 'chem', name: 'Polymers', chapterNumber: 13, isCompleted: false, understandingLevel: 2, estimatedHours: 3, actualHours: 1, lastStudied: null, revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'chem-14', subjectId: 'chem', name: 'Chemistry in Everyday Life', chapterNumber: 14, isCompleted: false, understandingLevel: 1, estimatedHours: 3, actualHours: 0, lastStudied: null, revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'chem-15', subjectId: 'chem', name: 'Carboxylic Acids', chapterNumber: 15, isCompleted: false, understandingLevel: 2, estimatedHours: 4, actualHours: 2, lastStudied: daysAgo(7), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'chem-16', subjectId: 'chem', name: 'Haloarenes', chapterNumber: 16, isCompleted: false, understandingLevel: 1, estimatedHours: 3, actualHours: 0.5, lastStudied: daysAgo(14), revisionCount: 0, nextRevision: null, formulas: [] },
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
      { id: 'math-1', subjectId: 'math', name: 'Relations & Functions', chapterNumber: 1, isCompleted: true, understandingLevel: 5, estimatedHours: 6, actualHours: 6.5, lastStudied: daysAgo(3), revisionCount: 4, nextRevision: daysFromNow(5), formulas: [] },
      { id: 'math-2', subjectId: 'math', name: 'Inverse Trigonometric Functions', chapterNumber: 2, isCompleted: true, understandingLevel: 4, estimatedHours: 5, actualHours: 5, lastStudied: daysAgo(5), revisionCount: 3, nextRevision: daysFromNow(3), formulas: [
        { id: 'mf1', chapterId: 'math-2', title: "sin⁻¹ + cos⁻¹", content: "sin⁻¹x + cos⁻¹x = π/2", memorized: true },
      ]},
      { id: 'math-3', subjectId: 'math', name: 'Matrices', chapterNumber: 3, isCompleted: true, understandingLevel: 5, estimatedHours: 7, actualHours: 7, lastStudied: daysAgo(2), revisionCount: 5, nextRevision: daysFromNow(7), formulas: [] },
      { id: 'math-4', subjectId: 'math', name: 'Determinants', chapterNumber: 4, isCompleted: true, understandingLevel: 5, estimatedHours: 7, actualHours: 8, lastStudied: daysAgo(4), revisionCount: 4, nextRevision: daysFromNow(5), formulas: [
        { id: 'mf2', chapterId: 'math-4', title: "Cramer's Rule", content: "x = Dx/D, y = Dy/D, z = Dz/D", memorized: true },
      ]},
      { id: 'math-5', subjectId: 'math', name: 'Continuity & Differentiability', chapterNumber: 5, isCompleted: true, understandingLevel: 4, estimatedHours: 9, actualHours: 10, lastStudied: daysAgo(6), revisionCount: 3, nextRevision: daysFromNow(2), formulas: [
        { id: 'mf3', chapterId: 'math-5', title: "Chain Rule", content: "d/dx[f(g(x))] = f'(g(x))·g'(x)", memorized: true },
      ]},
      { id: 'math-6', subjectId: 'math', name: 'Application of Derivatives', chapterNumber: 6, isCompleted: true, understandingLevel: 5, estimatedHours: 10, actualHours: 11, lastStudied: daysAgo(1), revisionCount: 5, nextRevision: daysFromNow(6), formulas: [] },
      { id: 'math-7', subjectId: 'math', name: 'Integrals', chapterNumber: 7, isCompleted: true, understandingLevel: 4, estimatedHours: 12, actualHours: 13, lastStudied: daysAgo(3), revisionCount: 3, nextRevision: daysFromNow(4), formulas: [
        { id: 'mf4', chapterId: 'math-7', title: "Integration by Parts", content: "∫udv = uv - ∫vdu", memorized: true },
      ]},
      { id: 'math-8', subjectId: 'math', name: 'Application of Integrals', chapterNumber: 8, isCompleted: true, understandingLevel: 4, estimatedHours: 6, actualHours: 6, lastStudied: daysAgo(7), revisionCount: 2, nextRevision: daysFromNow(3), formulas: [] },
      { id: 'math-9', subjectId: 'math', name: 'Differential Equations', chapterNumber: 9, isCompleted: true, understandingLevel: 3, estimatedHours: 8, actualHours: 9, lastStudied: daysAgo(9), revisionCount: 2, nextRevision: daysFromNow(1), formulas: [] },
      { id: 'math-10', subjectId: 'math', name: 'Vector Algebra', chapterNumber: 10, isCompleted: false, understandingLevel: 3, estimatedHours: 6, actualHours: 4, lastStudied: daysAgo(2), revisionCount: 0, nextRevision: null, formulas: [
        { id: 'mf5', chapterId: 'math-10', title: "Cross Product Magnitude", content: "|a×b| = |a||b|sinθ", memorized: true },
      ]},
      { id: 'math-11', subjectId: 'math', name: 'Three Dimensional Geometry', chapterNumber: 11, isCompleted: false, understandingLevel: 2, estimatedHours: 8, actualHours: 3, lastStudied: daysAgo(1), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'math-12', subjectId: 'math', name: 'Linear Programming', chapterNumber: 12, isCompleted: false, understandingLevel: 3, estimatedHours: 5, actualHours: 2, lastStudied: daysAgo(4), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'math-13', subjectId: 'math', name: 'Probability', chapterNumber: 13, isCompleted: false, understandingLevel: 2, estimatedHours: 7, actualHours: 2, lastStudied: daysAgo(3), revisionCount: 0, nextRevision: null, formulas: [
        { id: 'mf6', chapterId: 'math-13', title: "Bayes' Theorem", content: "P(A|B) = P(B|A)P(A)/P(B)", memorized: false },
      ]},
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
      { id: 'eng-1', subjectId: 'eng', name: 'Flamingo – Prose', chapterNumber: 1, isCompleted: true, understandingLevel: 5, estimatedHours: 6, actualHours: 6, lastStudied: daysAgo(5), revisionCount: 3, nextRevision: daysFromNow(7), formulas: [] },
      { id: 'eng-2', subjectId: 'eng', name: 'Flamingo – Poetry', chapterNumber: 2, isCompleted: true, understandingLevel: 4, estimatedHours: 5, actualHours: 5, lastStudied: daysAgo(8), revisionCount: 2, nextRevision: daysFromNow(4), formulas: [] },
      { id: 'eng-3', subjectId: 'eng', name: 'Vistas (Supplementary)', chapterNumber: 3, isCompleted: true, understandingLevel: 4, estimatedHours: 4, actualHours: 4.5, lastStudied: daysAgo(10), revisionCount: 2, nextRevision: daysFromNow(5), formulas: [] },
      { id: 'eng-4', subjectId: 'eng', name: 'Writing Skills', chapterNumber: 4, isCompleted: true, understandingLevel: 5, estimatedHours: 5, actualHours: 5, lastStudied: daysAgo(6), revisionCount: 3, nextRevision: daysFromNow(8), formulas: [] },
      { id: 'eng-5', subjectId: 'eng', name: 'Grammar', chapterNumber: 5, isCompleted: true, understandingLevel: 5, estimatedHours: 4, actualHours: 4, lastStudied: daysAgo(4), revisionCount: 4, nextRevision: daysFromNow(6), formulas: [] },
      { id: 'eng-6', subjectId: 'eng', name: 'Reading Comprehension', chapterNumber: 6, isCompleted: true, understandingLevel: 4, estimatedHours: 4, actualHours: 4, lastStudied: daysAgo(3), revisionCount: 2, nextRevision: daysFromNow(5), formulas: [] },
      { id: 'eng-7', subjectId: 'eng', name: 'Letter & Article Writing', chapterNumber: 7, isCompleted: false, understandingLevel: 3, estimatedHours: 3, actualHours: 2, lastStudied: daysAgo(7), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'eng-8', subjectId: 'eng', name: 'Notice & Advertisement', chapterNumber: 8, isCompleted: false, understandingLevel: 2, estimatedHours: 2, actualHours: 0.5, lastStudied: daysAgo(12), revisionCount: 0, nextRevision: null, formulas: [] },
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
      { id: 'cs-1', subjectId: 'cs', name: 'Python Revision Tour', chapterNumber: 1, isCompleted: true, understandingLevel: 5, estimatedHours: 5, actualHours: 4, lastStudied: daysAgo(6), revisionCount: 3, nextRevision: daysFromNow(7), formulas: [] },
      { id: 'cs-2', subjectId: 'cs', name: 'Object-Oriented Programming', chapterNumber: 2, isCompleted: true, understandingLevel: 5, estimatedHours: 7, actualHours: 7, lastStudied: daysAgo(4), revisionCount: 4, nextRevision: daysFromNow(5), formulas: [] },
      { id: 'cs-3', subjectId: 'cs', name: 'File Handling', chapterNumber: 3, isCompleted: true, understandingLevel: 5, estimatedHours: 4, actualHours: 3.5, lastStudied: daysAgo(7), revisionCount: 3, nextRevision: daysFromNow(6), formulas: [] },
      { id: 'cs-4', subjectId: 'cs', name: 'Exception Handling', chapterNumber: 4, isCompleted: true, understandingLevel: 4, estimatedHours: 3, actualHours: 3, lastStudied: daysAgo(9), revisionCount: 2, nextRevision: daysFromNow(4), formulas: [] },
      { id: 'cs-5', subjectId: 'cs', name: 'Data Structures (Stack & Queue)', chapterNumber: 5, isCompleted: true, understandingLevel: 5, estimatedHours: 8, actualHours: 8, lastStudied: daysAgo(3), revisionCount: 4, nextRevision: daysFromNow(8), formulas: [] },
      { id: 'cs-6', subjectId: 'cs', name: 'Database Management System', chapterNumber: 6, isCompleted: true, understandingLevel: 4, estimatedHours: 7, actualHours: 7.5, lastStudied: daysAgo(5), revisionCount: 3, nextRevision: daysFromNow(5), formulas: [] },
      { id: 'cs-7', subjectId: 'cs', name: 'SQL & MySQL', chapterNumber: 7, isCompleted: true, understandingLevel: 5, estimatedHours: 6, actualHours: 6.5, lastStudied: daysAgo(2), revisionCount: 4, nextRevision: daysFromNow(6), formulas: [] },
      { id: 'cs-8', subjectId: 'cs', name: 'Networking & Internet', chapterNumber: 8, isCompleted: false, understandingLevel: 3, estimatedHours: 5, actualHours: 3, lastStudied: daysAgo(3), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'cs-9', subjectId: 'cs', name: 'Boolean Logic', chapterNumber: 9, isCompleted: false, understandingLevel: 2, estimatedHours: 4, actualHours: 1.5, lastStudied: daysAgo(8), revisionCount: 0, nextRevision: null, formulas: [] },
      { id: 'cs-10', subjectId: 'cs', name: 'Cybersecurity & Society', chapterNumber: 10, isCompleted: false, understandingLevel: 2, estimatedHours: 3, actualHours: 1, lastStudied: daysAgo(11), revisionCount: 0, nextRevision: null, formulas: [] },
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
