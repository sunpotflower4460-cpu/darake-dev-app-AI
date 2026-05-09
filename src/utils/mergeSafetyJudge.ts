import type { AutoMergeSettings } from './autoMergeSettings';
import type { RiskLevel } from './riskyChangeDetector';

export type MergeSafetyDecision =
  | 'auto-merge-allowed'
  | 'merge-candidate'
  | 'manual-gate'
  | 'blocked'
  | 'not-ready';

export type MergeSafetyInput = {
  ciPassed: boolean;
  buildPassed: boolean;
  typecheckPassed: boolean;
  changedFiles: number;
  additions: number;
  deletions: number;
  riskLevel: RiskLevel;
  headSha?: string;
  prUrl?: string;
  prNumber?: number;
};

export type MergeSafetyJudgement = {
  decision: MergeSafetyDecision;
  reasons: string[];
  blockers: string[];
};

export function judgeMergeSafety(
  input: MergeSafetyInput,
  settings: AutoMergeSettings,
): MergeSafetyJudgement {
  const reasons: string[] = [];
  const blockers: string[] = [];

  // Hard blocks
  if (input.riskLevel === 'blocked') {
    return {
      decision: 'blocked',
      reasons: [],
      blockers: ['危険な変更が検出されました。手動確認が必要です。'],
    };
  }

  if (input.riskLevel === 'manual-gate') {
    return {
      decision: 'manual-gate',
      reasons: [],
      blockers: ['手動確認が必要なファイルが含まれています。'],
    };
  }

  // Missing required info
  if (!input.headSha) blockers.push('headShaが取得できていません');
  if (!input.prUrl) blockers.push('PR URLが取得できていません');
  if (!input.prNumber) blockers.push('PR番号が取得できていません');

  // CI/Build/Typecheck
  if (settings.requireCiSuccess && !input.ciPassed) {
    blockers.push('CIがまだ通っていません');
  } else if (input.ciPassed) {
    reasons.push('CI成功');
  }

  if (settings.requireBuildSuccess && !input.buildPassed) {
    blockers.push('Buildがまだ通っていません');
  } else if (input.buildPassed) {
    reasons.push('Build成功');
  }

  if (!input.typecheckPassed) {
    blockers.push('Typecheckがまだ通っていません');
  } else {
    reasons.push('Typecheck成功');
  }

  // Size limits
  if (input.changedFiles > settings.maxChangedFiles) {
    blockers.push(`変更ファイル数が上限(${settings.maxChangedFiles})を超えています`);
  } else {
    reasons.push(`変更ファイル数が適切です(${input.changedFiles})`);
  }

  if (input.additions > settings.maxAdditions) {
    blockers.push(`追加行数が上限(${settings.maxAdditions})を超えています`);
  } else {
    reasons.push(`追加行数が適切です(${input.additions})`);
  }

  if (input.deletions > settings.maxDeletions) {
    blockers.push(`削除行数が上限(${settings.maxDeletions})を超えています`);
  } else {
    reasons.push(`削除行数が適切です(${input.deletions})`);
  }

  if (blockers.length > 0) {
    return { decision: 'not-ready', reasons, blockers };
  }

  // Safe — decide based on mode
  if (settings.mode === 'low-risk-only') {
    return { decision: 'auto-merge-allowed', reasons, blockers: [] };
  }

  return { decision: 'merge-candidate', reasons, blockers: [] };
}
