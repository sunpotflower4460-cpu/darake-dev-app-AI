import type {
  WakeActionKind,
  WakeActionTokenRecord,
  GetWakeActionRequest,
  GetWakeActionResponse,
  RunWakeActionRequest,
  RunWakeActionResponse,
} from './wakeActionTypes';

export type { WakeActionKind, WakeActionTokenRecord, GetWakeActionResponse, RunWakeActionResponse };

export async function getWakeAction(
  tokenId: string,
): Promise<GetWakeActionResponse> {
  try {
    const res = await fetch('/api/darake/wake-action/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenId } satisfies GetWakeActionRequest),
    });
    return (await res.json()) as GetWakeActionResponse;
  } catch {
    return { ok: false, code: 'UNKNOWN_ERROR', error: 'Wake Action の取得に失敗しました' };
  }
}

export async function runWakeAction(
  tokenId: string,
): Promise<RunWakeActionResponse> {
  try {
    const res = await fetch('/api/darake/wake-action/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenId } satisfies RunWakeActionRequest),
    });
    return (await res.json()) as RunWakeActionResponse;
  } catch {
    return {
      ok: false,
      code: 'UNKNOWN_ERROR',
      error: 'Wake Action の実行に失敗しました',
    };
  }
}
