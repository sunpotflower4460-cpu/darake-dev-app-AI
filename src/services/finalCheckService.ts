import type { VisionImageInput } from '../utils/visionResult';

export type FinalCheckResult = {
  projectId: string;
  complete: boolean;
  score: number;
  blockers: string[];
  reasonsNotDone: string[];
  notes: string;
  previewUrl?: string;
  createdAt: string;
};

export type FinalCheckResponse =
  | { ok: true; result: FinalCheckResult }
  | { ok: false; code: string; error: string };

export async function postFinalCheck(body: {
  projectId: string;
  previewUrl?: string;
  designAssets: VisionImageInput[];
  capturedScreenshots: VisionImageInput[];
}): Promise<FinalCheckResponse> {
  try {
    const res = await fetch('/api/darake/verify/final-check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as FinalCheckResponse | null;
    if (!json) return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}
