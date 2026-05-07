import type { PrHealth } from './prHealthSummary';

export type FailureSummaryKind =
  | 'typecheck'
  | 'build'
  | 'test'
  | 'lint'
  | 'review'
  | 'unknown';

export type FailureSummary = {
  kind: FailureSummaryKind;
  shortMessage: string;
  likelyFiles: string[];
  rawExcerpt?: string;
};

export function buildFailureSummaryFromPrHealth(
  health: PrHealth,
  details?: string[],
): FailureSummary {
  if (health === 'checks-failed') {
    const rawExcerpt = details?.join('\n');
    return {
      kind: 'build',
      shortMessage: 'Buildに失敗しています。TypeScriptまたはVite buildのエラーを確認してください。',
      likelyFiles: [],
      rawExcerpt,
    };
  }
  if (health === 'review-needed') {
    return {
      kind: 'review',
      shortMessage: 'レビューで問題が見つかりました。指摘内容を確認してください。',
      likelyFiles: [],
    };
  }
  return {
    kind: 'unknown',
    shortMessage: '作業が止まっています。PR状態を確認してください。',
    likelyFiles: [],
  };
}

// Future extension: parse actual GitHub Actions log text for specific error kinds
export function parseFailureKindFromLog(logText: string): FailureSummaryKind {
  if (/tsc|typecheck|type error/i.test(logText)) return 'typecheck';
  if (/vite build|build failed|esbuild/i.test(logText)) return 'build';
  if (/jest|vitest|test failed/i.test(logText)) return 'test';
  if (/eslint|lint/i.test(logText)) return 'lint';
  return 'unknown';
}
