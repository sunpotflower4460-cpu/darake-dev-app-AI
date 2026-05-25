// Shared types for remote run registry (used by both worker and frontend).

export type DarakeRemoteRunStatus =
  | 'active'
  | 'paused'
  | 'needs-human'
  | 'merge-candidate'
  | 'blocked'
  | 'done'
  | 'failed';

export type DarakeRemoteRun = {
  id: string;
  appName: string;
  repoUrl: string;
  issueUrl?: string;
  issueNumber?: number;
  prUrl?: string;
  prNumber?: number;
  status: DarakeRemoteRunStatus;
  autoFixAttempts: number;
  maxAutoFixAttempts: number;
  lastCheckedAt?: string;
  nextCheckAfter?: string;
  lastWakeReason?: string;
  wakeSentAt?: string;
  createdAt: string;
  updatedAt: string;
  /** Set when this run belongs to a parallel project orchestration. */
  projectId?: string;
  phaseId?: string;
  /** Screenshot-vs-design verify attempt counter (separate from build autofix). */
  verifyAttempts?: number;
};

export type RegisterDarakeRunRequest = {
  appName: string;
  repoUrl: string;
  issueUrl?: string;
  issueNumber?: number;
  prUrl?: string;
  prNumber?: number;
};

export type RegisterDarakeRunResponse =
  | { ok: true; runId: string; status: 'active' }
  | {
      ok: false;
      code:
        | 'DISABLED'
        | 'MISSING_STORAGE'
        | 'INVALID_INPUT'
        | 'REPO_NOT_ALLOWED'
        | 'UNKNOWN_ERROR';
      error: string;
    };

export type GetDarakeRunRequest = {
  runId: string;
};

export type GetDarakeRunResponse =
  | { ok: true; run: DarakeRemoteRun }
  | {
      ok: false;
      code: 'NOT_FOUND' | 'DISABLED' | 'UNKNOWN_ERROR';
      error: string;
    };

export type TestNotificationRequest = {
  channel: 'telegram' | 'webhook';
};

export type TestNotificationResponse =
  | { ok: true; message: '通知テストを送信しました' }
  | { ok: false; error: string; code: 'DISABLED' | 'MISSING_SECRET' | 'SEND_FAILED' };

export type DarakeWebhookPayload = {
  title: string;
  message: string;
  reason: string;
  nextActionLabel: string;
  actionUrl?: string;
  createdAt: string;
};
