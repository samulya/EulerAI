export type AgeGroup = '8-10' | '11-13' | '14-18' | 'university' | 'jee' | 'olympiad' | 'research';
export type LearningGoal = 'school' | 'jee' | 'olympiad' | 'university' | 'research';
export type TeachingMode = 'hint' | 'teach' | 'step-by-step' | 'full';

export interface UserProfile {
  name: string;
  ageGroup: AgeGroup;
  country: string;
  goal: LearningGoal;
  createdAt: string;
}

export interface WorkedExample {
  problem: string;
  steps: string[] | Array<{ step: string; reason: string }>;
  answer?: string;
}

export interface MathStep {
  step: number;
  action: string;
  detail: string;
}

export interface AIResponse {
  concept: string;
  explanation?: string;
  hint?: string;
  theory?: string;
  worked_example?: WorkedExample;
  steps?: MathStep[];
  practice_question?: string;
  next_topic?: string;
  analogy?: string;
  verification?: string;
  real_world?: string;
  mock?: boolean;
  message?: string;
  profile_adapted?: string;
}

export interface HistoryEntry {
  id: string;
  question: string;
  mode: TeachingMode;
  response: AIResponse;
  timestamp: string;
  understood: boolean | null;
  topic?: string;
}

export interface Progress {
  totalQuestions: number;
  strongTopics: string[];
  weakTopics: string[];
  lastActive: string;
}
