export type DeepBuildPhaseKind =
  | 'design'
  | 'ui-shell'
  | 'core-implementation'
  | 'worker-api'
  | 'test'
  | 'fix'
  | 'review'
  | 'mobile-polish'
  | 'final-polish';

export type DeepBuildPhaseStatus =
  | 'planned'
  | 'issue-ready'
  | 'agent-working'
  | 'pr-open'
  | 'checks-running'
  | 'needs-fix'
  | 'fix-requested'
  | 'reviewing'
  | 'done'
  | 'blocked-hard';

export type DeepBuildOverallStatus =
  | 'idle'
  | 'planning'
  | 'building'
  | 'fixing'
  | 'reviewing'
  | 'complete-candidate'
  | 'blocked-hard';

export type DeepBuildCompletionSignal =
  | 'build-passed'
  | 'typecheck-passed'
  | 'pr-merged'
  | 'manual-risk-clear'
  | 'mobile-checked'
  | 'ui-reviewed'
  | 'requirements-covered';

export type DeepBuildRiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export type DeepBuildPhase = {
  id: string;
  order: number;
  kind: DeepBuildPhaseKind;
  title: string;
  purpose: string;
  agentInstruction: string;
  doneWhen: string[];
  status: DeepBuildPhaseStatus;
  issueNumber?: number;
  issueUrl?: string;
  prNumber?: number;
  prUrl?: string;
  autoFixAttempts?: number;
  maxAutoFixAttempts?: number;
  riskLevel?: DeepBuildRiskLevel;
  ciStatus?: 'unknown' | 'running' | 'passed' | 'failed';
  previewUrl?: string;
  humanCheckDone?: boolean;
  completionCandidate?: boolean;
};

export type DeepBuildCompletionContract = {
  mustPass: DeepBuildCompletionSignal[];
  humanReviewRequiredFor: string[];
  finalReviewChecklist: string[];
};

export type DeepBuildPlan = {
  id: string;
  appName: string;
  oneLineIdea: string;
  goal: string;
  currentPhaseId?: string;
  overallStatus: DeepBuildOverallStatus;
  phases: DeepBuildPhase[];
  completionContract: DeepBuildCompletionContract;
  createdAt: string;
  updatedAt: string;
};

export type DeepBuildCompletionJudgement = {
  status: 'not-ready' | 'complete-candidate' | 'blocked-hard';
  title: string;
  message: string;
  missing: string[];
  blocking: string[];
};

export const DEEP_BUILD_MODE_STORAGE_KEY = 'darake.deepBuildPlan.v1';
