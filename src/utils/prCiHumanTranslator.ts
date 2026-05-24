export type CiStatus = 'unknown' | 'running' | 'passed' | 'failed' | 'skipped';
export type ReviewStatus = 'none' | 'pending' | 'approved' | 'changes-requested' | 'dismissed';
export type MergeReadiness = 'not-ready' | 'ready' | 'merged' | 'blocked' | 'unknown';

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
      headline: 'このPRはマージ済みです。',
      subline: '最新の反映状態だけ確認してください。',
      nextAction: '次のPhaseへ進めます',
      level: 'ok',
      canMerge: false,
    };
  }

  if (mergeReadiness === 'blocked') {
    return {
      headline: 'コンフリクトがあります。人間確認が必要です。',
      subline: 'コンフリクト解消後に再確認してください。',
      nextAction: 'PR画面で競合ファイルを確認してください',
      level: 'error',
      canMerge: false,
    };
  }

  if (ciStatus === 'failed') {
    return {
      headline: 'CI失敗。AIに修正依頼できます。',
      subline: '失敗したjobや型エラーを確認してください。',
      nextAction: 'AIに修正依頼できます',
      level: 'error',
      canMerge: false,
    };
  }

  if (ciStatus === 'running') {
    return {
      headline: 'CI実行中です。少し待ってから再確認してください。',
      subline: '完了後にもう一度状態を取得してください。',
      nextAction: '少し待ってから再確認してください',
      level: 'neutral',
      canMerge: false,
    };
  }

  if (reviewStatus === 'changes-requested') {
    return {
      headline: 'レビューで修正依頼があります。内容を確認してください。',
      subline: 'レビューコメントを確認してから更新してください。',
      nextAction: 'レビュー内容を確認してください',
      level: 'warn',
      canMerge: false,
    };
  }

  if (mergeReadiness === 'ready' && ciStatus === 'passed') {
    return {
      headline: 'CI成功。マージできそうです。',
      subline:
        reviewStatus === 'approved'
          ? 'レビューも承認済みです。'
          : '最終確認後にマージへ進めます。',
      nextAction: 'PRを開いて最終確認してください',
      level: 'ok',
      canMerge: true,
    };
  }

  if (ciStatus === 'passed' && reviewStatus === 'pending') {
    return {
      headline: 'レビュー待ちです。',
      subline: 'レビュアーの確認が終わるまで待ってください。',
      nextAction: 'レビュー完了後に再確認してください',
      level: 'warn',
      canMerge: false,
    };
  }

  if (ciStatus === 'passed') {
    return {
      headline: 'CI成功。レビュー状態を確認してください。',
      subline: 'マージ条件を満たしているか確認しましょう。',
      nextAction: 'PR画面でレビュー状態を確認してください',
      level: 'ok',
      canMerge: false,
    };
  }

  return {
    headline: 'PR状態を確認中です。',
    subline: 'GitHub連携とPR番号を確認してください。',
    nextAction: '状態を取得し直してください',
    level: 'neutral',
    canMerge: false,
  };
}

export function buildMockPrCiSnapshot(override?: Partial<PrCiSnapshot>): PrCiSnapshot {
  return {
    prTitle: 'Phase 103: PR/CI状態の人間向け要約',
    prNumber: 185,
    ciStatus: 'passed',
    reviewStatus: 'approved',
    mergeReadiness: 'ready',
    updatedAt: new Date().toISOString(),
    ...override,
  };
}
