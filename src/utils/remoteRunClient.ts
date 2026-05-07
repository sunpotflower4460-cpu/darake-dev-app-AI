import type {
  RegisterDarakeRunRequest,
  RegisterDarakeRunResponse,
  GetDarakeRunRequest,
  GetDarakeRunResponse,
  TestNotificationRequest,
  TestNotificationResponse,
  DarakeRemoteRun,
} from './darakeRemoteRun';
import { saveRemoteRunLink, loadRemoteRunLink } from './remoteRunLink';
import { saveDarakeAutopilotState, loadDarakeAutopilotState } from './darakeAutopilotState';

export type { RegisterDarakeRunResponse, GetDarakeRunResponse, TestNotificationResponse };

/**
 * Register a new run with the Worker Run Registry.
 * Saves the returned runId to localStorage (never exposes tokens to frontend).
 */
export async function registerRemoteRun(
  req: RegisterDarakeRunRequest,
): Promise<RegisterDarakeRunResponse> {
  try {
    const res = await fetch('/api/darake/runs/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    const data = (await res.json()) as RegisterDarakeRunResponse;

    if (data.ok) {
      const now = new Date().toISOString();
      saveRemoteRunLink({
        runId: data.runId,
        appName: req.appName,
        repoUrl: req.repoUrl,
        issueUrl: req.issueUrl,
        prUrl: req.prUrl,
        createdAt: now,
        updatedAt: now,
      });
    }

    return data;
  } catch {
    return {
      ok: false,
      code: 'UNKNOWN_ERROR',
      error: 'Run Registry への接続に失敗しました',
    };
  }
}

/**
 * Fetch current run status from Worker.
 * Called on app startup if a remoteRunLink exists.
 * Updates the local DarakeAutopilotState with the latest Worker state.
 * Fails gracefully — never crashes the app.
 */
export async function syncRemoteRunState(): Promise<DarakeRemoteRun | null> {
  const link = loadRemoteRunLink();
  if (!link) return null;

  const req: GetDarakeRunRequest = { runId: link.runId };

  try {
    const res = await fetch('/api/darake/runs/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    const data = (await res.json()) as GetDarakeRunResponse;

    if (!data.ok) return null;

    const run = data.run;

    // Merge remote state into local autopilot state
    const local = loadDarakeAutopilotState();
    if (local) {
      const remoteStatus = mapRemoteStatusToLocal(run.status);
      saveDarakeAutopilotState({
        ...local,
        status: remoteStatus,
        prUrl: run.prUrl ?? local.prUrl,
        prNumber: run.prNumber ?? local.prNumber,
        issueUrl: run.issueUrl ?? local.issueUrl,
        issueNumber: run.issueNumber ?? local.issueNumber,
        autoFixAttempts: run.autoFixAttempts,
        shouldWakeUser:
          run.status === 'needs-human' ||
          run.status === 'merge-candidate' ||
          run.status === 'blocked',
        wakeReason: run.lastWakeReason,
      });
    }

    return run;
  } catch {
    // Fail gracefully — do not crash the app
    return null;
  }
}

function mapRemoteStatusToLocal(
  remoteStatus: DarakeRemoteRun['status'],
): import('./darakeAutopilotState').DarakeAutopilotStatus {
  switch (remoteStatus) {
    case 'active':
      return 'watching-pr';
    case 'paused':
      return 'waiting-for-checks';
    case 'needs-human':
      return 'needs-human';
    case 'merge-candidate':
      return 'merge-candidate';
    case 'blocked':
      return 'blocked';
    case 'done':
      return 'done';
    case 'failed':
      return 'failed';
    default:
      return 'watching-pr';
  }
}

/**
 * Send a test notification via the Worker.
 */
export async function testNotification(
  req: TestNotificationRequest,
): Promise<TestNotificationResponse> {
  try {
    const res = await fetch('/api/darake/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return (await res.json()) as TestNotificationResponse;
  } catch {
    return {
      ok: false,
      error: '通知テストの送信に失敗しました',
      code: 'SEND_FAILED',
    };
  }
}
