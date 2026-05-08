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
  /** Used by send-fix-request to post the pre-generated comment body. Not returned to frontend. */
  repoUrl?: string;
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
  | {
      ok: true;
      action: WakeActionTokenRecord;
    }
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
