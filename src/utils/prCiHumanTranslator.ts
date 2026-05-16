export type CiStatus = 'unknown' | 'running' | 'passed' | 'failed' | 'skipped';
export type ReviewStatus = 'none' | 'pending' | 'approved' | 'changes-requested' | 'dismissed';
export type MergeReadiness = 'not-ready' | 'ready' | 'merged' | 'blocked';

export type PrCiSnapshot = {
  prTitle: string;
  prNumber: number;
  ciStatus: CiStatus;
  reviewStatus: ReviewStatus;
  mergeReadiness: MergeReadiness;
  updatedAt: string;
};

export type PrCiHumanSummary = {
  headline: string;
  subline: string;
  nextAction: string;
  level: 'ok' | 'warn' | 'error' | 'neutral';
  canMerge: boolean;
};

export function translatePrCiToHuman(snapshot: PrCiSnapshot): PrCiHumanSummary {
  const { ciStatus, reviewStatus, mergeReadiness } = snapshot;

  if (mergeReadiness === 'merged') {
    return {
      headline: 'マージ完了です',
      subline: 'このPRは取り込まれました。',
      nextAction: '次のPhaseへ進みましょう',
      level: 'ok',
      canMerge: false,
    };
  }

  if (mergeReadiness === 'blocked') {
    return {
      headline: '手動での対応が必要です',
      subline: 'コンフリクトや権限の問題がある可能性があります。',
      nextAction: 'PRを開いて確認してください',
      level: 'error',
      canMerge: false,
    };
  }

  if (ciStatus === 'failed') {
    return {
      headline: 'CIが失敗しました',
      subline: '型エラーまたはビルドエラーが出ている可能性があります。',
      nextAction: 'AIに修正依頼できます',
      level: 'error',
      canMerge: false,
    };
  }

  if (ciStatus === 'running') {
    return {
      headline: 'CIが実行中です',
      subline: '少し待つと結果が出ます。',
      nextAction: '何もしなくてOK',
      level: 'neutral',
      canMerge: false,
    };
  }

  if (reviewStatus === 'changes-requested') {
    return {
      headline: 'レビューで修正依頼があります',
      subline: '修正してから再度プッシュしてください。',
      nextAction: 'レビューコメントを確認してください',
      level: 'warn',
      canMerge: false,
    };
  }

  if (mergeReadiness === 'ready' && ciStatus === 'passed') {
    return {
      headline: 'マージできる状態です',
      subline: 'CIが通り、レビューも問題ありません。',
      nextAction: 'PRを開いてマージを確認してください',
      level: 'ok',
      canMerge: true,
    };
  }

  if (ciStatus === 'passed' && reviewStatus === 'none') {
    return {
      headline: 'CIが通りました',
      subline: 'レビュー待ちか、または自動マージの準備ができています。',
      nextAction: 'まだ何もしなくてOK',
      level: 'ok',
      canMerge: false,
    };
  }

  return {
    headline: '確認中です',
    subline: 'PRの状態を読み込んでいます。',
    nextAction: '少し待ってください',
    level: 'neutral',
    canMerge: false,
  };
}

export function buildMockPrCiSnapshot(override?: Partial<PrCiSnapshot>): PrCiSnapshot {
  return {
    prTitle: 'Phase 95: PR/CI状態の人間向け要約',
    prNumber: 195,
    ciStatus: 'passed',
    reviewStatus: 'none',
    mergeReadiness: 'ready',
    updatedAt: new Date().toISOString(),
    ...override,
  };
}
