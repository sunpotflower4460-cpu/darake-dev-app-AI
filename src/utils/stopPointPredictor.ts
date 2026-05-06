export type PredictedStopPoint = {
  id: string;
  label: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  canAvoidByPreparation: boolean;
  preparationAction: string;
};

export const KNOWN_STOP_POINT_PATTERNS: Omit<
  PredictedStopPoint,
  'id'
>[] = [
  {
    label: 'secretが必要',
    reason: 'API key / token / secret が未設定です',
    severity: 'high',
    canAvoidByPreparation: true,
    preparationAction: '事前に secret を手動で確認・準備してください',
  },
  {
    label: 'GitHub操作が必要',
    reason: 'PR作成 / Issue作成 / merge などのGitHub操作が必要です',
    severity: 'high',
    canAvoidByPreparation: true,
    preparationAction: '手動でGitHub操作を行ってください',
  },
  {
    label: 'App Store操作が必要',
    reason: 'App Store Connect での操作が必要です',
    severity: 'high',
    canAvoidByPreparation: true,
    preparationAction: 'App Store Connect を手動で操作してください',
  },
  {
    label: 'workflow実行が必要',
    reason: 'GitHub Actions workflow の dispatch が必要です',
    severity: 'medium',
    canAvoidByPreparation: true,
    preparationAction: 'GitHub Actions を手動でトリガーしてください',
  },
  {
    label: 'AIレビュー結果待ち',
    reason: 'AIレビューの結果がまだペーストされていません',
    severity: 'medium',
    canAvoidByPreparation: true,
    preparationAction: 'AIへのプロンプトをコピーして結果を取得してください',
  },
  {
    label: '人間の選択が必要',
    reason: 'manual gate: 人間による判断が必要です',
    severity: 'medium',
    canAvoidByPreparation: false,
    preparationAction: 'OK / Stop / Later で判断してください',
  },
  {
    label: 'CI失敗の可能性',
    reason: 'ビルド / テスト / CIが失敗する可能性があります',
    severity: 'medium',
    canAvoidByPreparation: true,
    preparationAction: 'npm run typecheck / npm run build を事前確認してください',
  },
  {
    label: 'private情報確認が必要',
    reason: '非公開情報 / 個人情報の確認が必要です',
    severity: 'high',
    canAvoidByPreparation: false,
    preparationAction: '手動で確認してください',
  },
];

export function buildStopPointPredictions(
  candidateKind: string,
  customLabels: string[] = []
): PredictedStopPoint[] {
  const base: PredictedStopPoint[] = KNOWN_STOP_POINT_PATTERNS.filter(
    (p) => {
      if (
        candidateKind === 'github-issue-dry-run' ||
        candidateKind === 'github-pr-dry-run' ||
        candidateKind === 'workflow-dispatch-dry-run'
      ) {
        return (
          p.label === 'GitHub操作が必要' ||
          p.label === 'CI失敗の可能性' ||
          p.label === '人間の選択が必要'
        );
      }
      if (candidateKind === 'app-store-prep') {
        return (
          p.label === 'App Store操作が必要' ||
          p.label === 'secretが必要' ||
          p.label === '人間の選択が必要'
        );
      }
      if (candidateKind === 'ai-review-manual') {
        return (
          p.label === 'AIレビュー結果待ち' ||
          p.label === '人間の選択が必要'
        );
      }
      return p.severity === 'high';
    }
  ).map((p) => ({
    ...p,
    id: `sp-${crypto.randomUUID()}`,
  }));

  const custom: PredictedStopPoint[] = customLabels.map((label) => ({
    id: `sp-${crypto.randomUUID()}`,
    label,
    reason: 'カスタム止まり条件',
    severity: 'medium' as const,
    canAvoidByPreparation: false,
    preparationAction: '手動で対応してください',
  }));

  return [...base, ...custom];
}

export function formatStopPointPredictionsMarkdown(
  points: PredictedStopPoint[]
): string {
  if (points.length === 0) return '止まりそうな場所はありません。';
  const lines = ['## 予測される止まり場所'];
  points.forEach((p) => {
    const sev =
      p.severity === 'high' ? '🔴' : p.severity === 'medium' ? '🟡' : '🟢';
    lines.push(
      `${sev} **${p.label}**`,
      `  理由: ${p.reason}`
    );
    if (p.canAvoidByPreparation) {
      lines.push(`  ✅ 事前対応: ${p.preparationAction}`);
    } else {
      lines.push(`  ⏳ 対応: ${p.preparationAction}`);
    }
  });
  return lines.join('\n');
}
