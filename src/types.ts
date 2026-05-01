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

export type ControlMode = 'keep_going' | 'pause_each_phase' | 'pause_on_risk' | 'finish_then_notify';

export type AgentCheck = {
  name: string;
  role: string;
  status: 'ready' | 'checking' | 'passed' | 'needs_human';
  message: string;
};

export type ScreenshotCheck = {
  label: string;
  viewport: 'mobile' | 'desktop';
  status: 'planned' | 'captured' | 'needs_review';
  note: string;
};

export type NotificationPlan = {
  mode: ControlMode;
  channels: string[];
  message: string;
};

export type GeneratedPlan = {
  title: string;
  summary: string;
  nextActions: string[];
  humanStops: string[];
};
