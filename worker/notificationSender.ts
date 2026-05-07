import type { DarakeWebhookPayload } from '../src/utils/darakeRemoteRun';

export type NotificationEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  NOTIFICATION_WEBHOOK_URL?: string;
};

export type SendNotificationResult =
  | { ok: true }
  | { ok: false; error: string; code: 'MISSING_SECRET' | 'SEND_FAILED' };

/**
 * Send a Telegram message.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Worker Secrets.
 * Never exposes tokens to frontend.
 */
export async function sendTelegramNotification(
  env: NotificationEnv,
  payload: DarakeWebhookPayload,
): Promise<SendNotificationResult> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID が設定されていません', code: 'MISSING_SECRET' };
  }

  const text = [
    'だらけ管制室',
    '起きる必要があります。',
    `理由：\n${payload.reason}`,
    `次にやること：\n${payload.nextActionLabel}`,
    payload.actionUrl ? payload.actionUrl : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    );

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { description?: string } | null;
      return {
        ok: false,
        error: body?.description ?? `Telegram API error: ${res.status}`,
        code: 'SEND_FAILED',
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Telegram送信でエラーが発生しました',
      code: 'SEND_FAILED',
    };
  }
}

/**
 * Send a webhook notification.
 * Requires NOTIFICATION_WEBHOOK_URL in Worker Secrets.
 * Never exposes tokens to frontend.
 */
export async function sendWebhookNotification(
  env: NotificationEnv,
  payload: DarakeWebhookPayload,
): Promise<SendNotificationResult> {
  if (!env.NOTIFICATION_WEBHOOK_URL) {
    return { ok: false, error: 'NOTIFICATION_WEBHOOK_URL が設定されていません', code: 'MISSING_SECRET' };
  }

  try {
    const res = await fetch(env.NOTIFICATION_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Webhook error: ${res.status}`,
        code: 'SEND_FAILED',
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Webhook送信でエラーが発生しました',
      code: 'SEND_FAILED',
    };
  }
}

/**
 * Returns whether a wake notification should be sent, considering dedup window.
 */
const WAKE_DEDUP_WINDOW_MS = 1000 * 60 * 60 * 6; // 6時間

export function shouldSendWake(
  lastWakeReason: string | undefined,
  wakeSentAt: string | undefined,
  newReason: string,
): boolean {
  if (lastWakeReason !== newReason) return true;
  if (!wakeSentAt) return true;
  return Date.now() - new Date(wakeSentAt).getTime() > WAKE_DEDUP_WINDOW_MS;
}

/**
 * Reasons that should trigger a wake notification.
 */
export const WAKE_NOTIFY_REASONS = new Set([
  'merge-candidate',
  'ci-failed-max-retry',
  'dangerous-change',
  'secret-needed',
  'billing-needed',
  'app-store-needed',
  'pr-candidates-multiple',
  'agent-stuck',
  'unknown-blocker',
]);

/**
 * Reasons that should NOT trigger a wake notification.
 */
export const WAKE_SILENT_REASONS = new Set([
  'issue-created',
  'agent-working',
  'pr-waiting',
  'checks-running',
  'auto-fix-comment-posted',
  'minor-note',
  'readme-updated',
]);
