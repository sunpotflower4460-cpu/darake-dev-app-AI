import type {
  GetWakeActionRequest,
  GetWakeActionResponse,
  RunWakeActionRequest,
  RunWakeActionResponse,
} from './darakeRemoteRun';

/**
 * Fetch a Wake Action Token record from the Worker.
 * Token types are NOT exposed — only the decoded record is returned.
 */
export async function getWakeAction(tokenId: string): Promise<GetWakeActionResponse> {
  const req: GetWakeActionRequest = { tokenId };
  try {
    const res = await fetch('/api/darake/wake-action/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return (await res.json()) as GetWakeActionResponse;
  } catch {
    return { ok: false, code: 'UNKNOWN_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}

/**
 * Execute the action described by the Wake Action Token.
 * Only safe, non-destructive actions are allowed on the Worker side.
 * merge / approve / secret changes are never executed here.
 */
export async function runWakeAction(tokenId: string): Promise<RunWakeActionResponse> {
  const req: RunWakeActionRequest = { tokenId };
  try {
    const res = await fetch('/api/darake/wake-action/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return (await res.json()) as RunWakeActionResponse;
  } catch {
    return {
      ok: false,
      code: 'UNKNOWN_ERROR',
      error: 'ネットワークエラーが発生しました',
    };
  }
}
