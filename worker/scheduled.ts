// Worker Cron Trigger handler for darake autopilot scheduled checks.
//
// To activate, add to wrangler.toml:
//   [triggers]
//   crons = ["*/10 * * * *"]
//
// And add a KV namespace binding:
//   [[kv_namespaces]]
//   binding = "RUN_REGISTRY_KV"
//   id = "<your-kv-namespace-id>"

import { runAutopilotScheduled } from './autopilotRunner';

type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  DARAKE_RUN_REGISTRY_ENABLED?: string;
  DARAKE_AUTOPILOT_SCHEDULE_ENABLED?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  NOTIFICATION_WEBHOOK_URL?: string;
  RUN_REGISTRY_KV?: KVNamespace;
  /** Public URL of the Pages app, e.g. https://your-app.pages.dev */
  APP_URL?: string;
  ASSETS: Fetcher;
};

type ScheduledEvent = {
  cron: string;
  scheduledTime: number;
};

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runAutopilotScheduled(env).catch((err) => {
        console.error('[darake-scheduled] Unhandled error:', err);
      }),
    );
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
