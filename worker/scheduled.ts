// Worker Cron Trigger scaffold for darake autopilot scheduled checks.
// Not yet active — Cron must be enabled in wrangler.toml to use this.
//
// To activate, add to wrangler.toml:
//   [triggers]
//   crons = ["*/5 * * * *"]
//
// Then wire scheduled() in the default export.

import type { ScheduledCheckInput, ScheduledCheckOutput } from '../src/utils/autopilotScheduledRun';

type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  ASSETS: Fetcher;
};

type ScheduledEvent = {
  cron: string;
  scheduledTime: number;
};

/**
 * Placeholder scheduled handler.
 * In a full implementation this would:
 * 1. Read stored autopilot state (e.g. from KV or Durable Objects)
 * 2. Call GitHub API to check PR / CI status
 * 3. Post fix comments if needed
 * 4. Store result back to KV
 * 5. Trigger a notification if human attention is needed
 */
async function handleScheduledRun(
  _event: ScheduledEvent,
  env: Env,
): Promise<void> {
  if (!env.GITHUB_TOKEN) {
    console.warn('[darake-scheduled] GITHUB_TOKEN not set — skipping');
    return;
  }

  // Scaffold: In the future, read from KV storage and run check
  const input: ScheduledCheckInput = {
    repoUrl: '',
  };

  // Import is dynamic to keep this scaffold typesafe without circular deps
  const { runScheduledAutopilotCheck } = await import('../src/utils/autopilotScheduledRun');
  const result: ScheduledCheckOutput = await runScheduledAutopilotCheck(input);

  if (result.shouldNotify) {
    console.log('[darake-scheduled] notify reason:', result.notifyReason);
  } else {
    console.log('[darake-scheduled] no action needed');
  }
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduledRun(event, env));
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
