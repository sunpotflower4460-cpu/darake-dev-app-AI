import type { SubmissionPlatform } from '../utils/submissionGate';

export type SubmitResponse =
  | { ok: true; status: string; message: string; externalUrl?: string }
  | { ok: false; code: string; error: string };

const ENDPOINTS: Record<SubmissionPlatform, string> = {
  web: '/api/darake/submit/web',
  ios: '/api/darake/submit/ios',
  android: '/api/darake/submit/android',
};

export async function submitPlatform(
  platform: SubmissionPlatform,
  body: { projectId: string; values?: Record<string, string> },
): Promise<SubmitResponse> {
  try {
    const res = await fetch(ENDPOINTS[platform], {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as SubmitResponse | null;
    if (!json) return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}
