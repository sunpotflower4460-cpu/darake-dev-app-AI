import { loadAiReviewResultRecords } from './aiReviewResultRecord';
import { loadAiReviewFixIssueDrafts } from './aiReviewFixIssueDraft';
import { AiReviewTarget } from './aiReviewInputPack';

export type AiReviewCompletionReport = {
  reviewedTargets: AiReviewTarget[];
  passedCount: number;
  warnCount: number;
  failedCount: number;
  uncheckedCount: number;
  blockers: string[];
  warnings: string[];
  fixIssueDraftCount: number;
  nextRecommendations: string[];
};

export function buildAiReviewCompletionReport(): AiReviewCompletionReport {
  const records = loadAiReviewResultRecords();
  const fixDrafts = loadAiReviewFixIssueDrafts();

  const reviewedTargets = [...new Set(records.map((r) => r.target))];
  const passedCount = records.filter((r) => r.status === 'passed').length;
  const warnCount = records.filter((r) => r.status === 'warn').length;
  const failedCount = records.filter((r) => r.status === 'failed').length;
  const uncheckedCount = records.filter((r) => r.status === 'unchecked').length;

  const blockers = records.filter((r) => r.status === 'failed').flatMap((r) => r.blockers);
  const warnings = records.filter((r) => r.status === 'warn').flatMap((r) => r.findings);

  const nextRecommendations: string[] = [];
  if (failedCount > 0) {
    nextRecommendations.push('failedレビューの修正Issueを作成して対応する');
  }
  if (warnCount > 0) {
    nextRecommendations.push('warnレビューの改善提案を確認する');
  }
  if (uncheckedCount > 0) {
    nextRecommendations.push('uncheckedの対象にAIレビューを実施する');
  }
  if (passedCount > 0) {
    nextRecommendations.push('通過済みの対象を次のフェーズへ進める');
  }
  nextRecommendations.push('Phase 24 で実AI連携準備へ進む（prompt pack + manual copy）');

  return {
    reviewedTargets,
    passedCount,
    warnCount,
    failedCount,
    uncheckedCount,
    blockers,
    warnings,
    fixIssueDraftCount: fixDrafts.length,
    nextRecommendations,
  };
}

export function formatAiReviewCompletionReportMarkdown(report: AiReviewCompletionReport): string {
  return [
    '# AIレビュー統合 完成レポート',
    '',
    `- レビュー済み対象: ${report.reviewedTargets.join(', ') || 'なし'}`,
    `- 通過: ${report.passedCount}件`,
    `- 警告: ${report.warnCount}件`,
    `- 失敗: ${report.failedCount}件`,
    `- 未確認: ${report.uncheckedCount}件`,
    `- 修正Issue下書き: ${report.fixIssueDraftCount}件`,
    '',
    '## Blockers',
    report.blockers.length > 0 ? report.blockers.map((b) => `- 🔴 ${b}`).join('\n') : '- なし',
    '',
    '## Warnings',
    report.warnings.length > 0 ? report.warnings.map((w) => `- ⚠️ ${w}`).join('\n') : '- なし',
    '',
    '## 次のおすすめ',
    ...report.nextRecommendations.map((r) => `- ${r}`),
    '',
    '## 安全方針',
    '- 外部AI APIを自動実行しません',
    '- 画像・artifactの自動送信はしません',
    '- AIレビュー結果は人間が確認してから保存します',
  ].join('\n');
}
