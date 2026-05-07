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

// ── Wake Action Token (shared between worker and frontend) ──

export type WakeActionKind =
  | 'open-pr'
  | 'send-fix-request'
  | 'copy-fallback-instruction'
  | 'open-issue'
  | 'show-setup'
  | 'show-details';

export type WakeActionTokenRecord = {
  tokenId: string;
  runId: string;
  reason: string;
  actionKind: WakeActionKind;
  actionUrl?: string;
  prUrl?: string;
  prNumber?: number;
  issueUrl?: string;
  issueNumber?: number;
  message: string;
  nextActionLabel: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
};

export type GetWakeActionRequest = {
  tokenId: string;
};

export type GetWakeActionResponse =
  | { ok: true; action: WakeActionTokenRecord }
  | {
      ok: false;
      code: 'NOT_FOUND' | 'EXPIRED' | 'USED' | 'DISABLED' | 'UNKNOWN_ERROR';
      error: string;
    };

export type RunWakeActionRequest = {
  tokenId: string;
};

export type RunWakeActionResponse =
  | {
      ok: true;
      status: 'done';
      message: string;
      actionUrl?: string;
    }
  | {
      ok: false;
      code:
        | 'NOT_FOUND'
        | 'EXPIRED'
        | 'USED'
        | 'ACTION_NOT_ALLOWED'
        | 'GITHUB_ERROR'
        | 'UNKNOWN_ERROR';
      error: string;
      fallbackText?: string;
    };
