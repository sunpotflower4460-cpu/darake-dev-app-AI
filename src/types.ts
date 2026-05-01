export type AutomationLevel = 'manual_first' | 'guided_auto' | 'near_full_auto';

export type RiskLevel = 'low' | 'medium' | 'high';

export type PhaseStatus = 'not_started' | 'running' | 'waiting_review' | 'passed' | 'blocked';

export type AppSeed = {
  title: string;
  soul: string;
  targetUser: string;
  desiredOutcome: string;
  stopTiming: string;
  automationLevel: AutomationLevel;
};

export type Blueprint = {
  purpose: string;
  mvp: string[];
  notDoing: string[];
  completionSignals: string[];
};

export type PhasePlan = {
  id: string;
  title: string;
  summary: string;
  status: PhaseStatus;
  risk: RiskLevel;
  autoRunnable: boolean;
  stopGate: string;
  doneDefinition: string;
};

export type ReviewCheck = {
  label: string;
  state: 'ok' | 'watch' | 'blocked' | 'pending';
  detail: string;
};

export type SubmissionDraft = {
  appName: string;
  subtitle: string;
  description: string;
  privacyNote: string;
  reviewNote: string;
};
