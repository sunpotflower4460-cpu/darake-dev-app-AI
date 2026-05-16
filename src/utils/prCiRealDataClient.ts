export type PrCiRealResult =
  | {
      ok: true;
      health: string;
      summary: string;
      details?: string[];
      prNumber: number;
    }
  | { ok: false; error: string };

export async function fetchPrCiRealData(
  repoUrl: string,
  prNumber: number,
): Promise<PrCiRealResult> {
  try {
    const res = await fetch('/api/darake/github/pr/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, prNumber }),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      ok?: boolean;
      health?: string;
      summary?: string;
      details?: string[];
    };
    if (!data.ok) {
      return { ok: false, error: 'APIレスポンスが不正です' };
    }
    return {
      ok: true,
      health: data.health ?? 'unknown',
      summary: data.summary ?? '',
      details: data.details,
      prNumber,
    };
  } catch {
    return { ok: false, error: '通信エラーが発生しました' };
  }
}
