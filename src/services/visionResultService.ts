import type {
  ListVisionResultsResponse,
  VisionCompareRequest,
  VisionCompareResponse,
} from '../utils/visionResult';

export async function postCompareScreenshots(
  body: VisionCompareRequest,
): Promise<VisionCompareResponse> {
  try {
    const res = await fetch('/api/darake/verify/compare-screenshots', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as VisionCompareResponse | null;
    if (!json) {
      return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    }
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}

export async function listVisionResults(
  projectId: string,
  limit = 20,
): Promise<ListVisionResultsResponse> {
  try {
    const res = await fetch('/api/darake/verify/list-results', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ projectId, limit }),
    });
    const json = (await res.json().catch(() => null)) as ListVisionResultsResponse | null;
    if (!json) {
      return { ok: false, code: 'INVALID_RESPONSE', error: 'レスポンスを読み取れません' };
    }
    return json;
  } catch {
    return { ok: false, code: 'NETWORK_ERROR', error: 'ネットワークエラーが発生しました' };
  }
}
