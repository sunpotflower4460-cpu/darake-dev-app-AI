// Design scaffold for Cloudflare Cron Trigger based autopilot scheduled run.
// This is not yet wired to a live Cron — it defines the shape for future use.

export type ScheduledAutopilotContext = {
  repoUrl: string;
  issueNumber?: number;
  prNumber?: number;
  maxAutoFixAttempts: number;
};

export type ScheduledAutopilotResult = {
  ok: boolean;
  action:
    | 'no-op'
    | 'issue-checked'
    | 'pr-found'
    | 'ci-checked'
    | 'fix-posted'
    | 'merge-candidate-flagged'
    | 'needs-human-flagged'
    | 'error';
  message: string;
  updatedAt: string;
};

export type ScheduledCheckInput = {
  repoUrl: string;
  issueNumber?: number;
  prNumber?: number;
};

export type ScheduledCheckOutput = {
  prFound: boolean;
  prUrl?: string;
  prNumber?: number;
  ciStatus?: string;
  ciSummary?: string;
  needsHuman: boolean;
  isMergeCandidate: boolean;
  shouldNotify: boolean;
  notifyReason?: string;
};

/**
 * Runs a scheduled autopilot check using Worker context.
 * Called by the Cloudflare Cron Trigger via worker/scheduled.ts.
 * Not yet active — scaffold for future use.
 */
export async function runScheduledAutopilotCheck(
  input: ScheduledCheckInput,
): Promise<ScheduledCheckOutput> {
  // This would be implemented to:
  // 1. Check if a PR exists for the given issue
  // 2. Get PR health (CI status)
  // 3. Determine if human notification is needed
  // 4. Return structured output for the worker to act on

  // Placeholder — actual GitHub API calls would go here in full implementation
  return {
    prFound: false,
    needsHuman: false,
    isMergeCandidate: false,
    shouldNotify: false,
  };
}
