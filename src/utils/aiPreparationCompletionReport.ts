import { AI_EXECUTION_CANDIDATE_DRAFTS } from './aiExecutionCandidateDraft';
import { AI_PROVIDER_CANDIDATES } from './aiProviderCandidates';
import { AI_RESULT_INTAKE_GUIDES } from './aiResultIntakeGuide';
import { buildAiPromptPack } from './aiPromptPackBuilder';
import { AI_REVIEW_OUTPUT_FORMATS } from './aiReviewOutputFormats';
import { AI_TASK_TYPE_REGISTRY } from './aiTaskTypeRegistry';

export type AiPreparationCompletionReport = {
  title: string;
  status: 'blocked' | 'needs-review' | 'ready-for-manual-ai-use';
  completed: string[];
  warnings: string[];
  blockers: string[];
  nextRecommendedPhase: string;
  nextActions: string[];
};

export function buildAiPreparationCompletionReport(): AiPreparationCompletionReport {
  const promptCoverage = AI_TASK_TYPE_REGISTRY.every((taskType) =>
    buildAiPromptPack(taskType.id, 'manual-ai', 'reviewed context').status !== 'blocked',
  );
  const outputCoverage = AI_TASK_TYPE_REGISTRY.every((taskType) =>
    AI_REVIEW_OUTPUT_FORMATS.some((format) => format.taskTypes.includes(taskType.id)),
  );
  const intakeCoverage = AI_TASK_TYPE_REGISTRY.every((taskType) =>
    AI_RESULT_INTAKE_GUIDES.some((guide) => guide.taskType === taskType.id),
  );
  const allExecutionDraftOnly = AI_EXECUTION_CANDIDATE_DRAFTS.every((draft) => draft.status === 'draft-only');

  const blockers: string[] = [];

  if (!promptCoverage) blockers.push('Prompt pack coverageが不足している');
  if (!outputCoverage) blockers.push('Output format coverageが不足している');
  if (!intakeCoverage) blockers.push('Result intake guide coverageが不足している');
  if (!allExecutionDraftOnly) blockers.push('Execution candidateにdraft-only以外が含まれている');

  const completed = [
    `AI provider候補: ${AI_PROVIDER_CANDIDATES.length}件を整理した`,
    `AI task type一覧: ${AI_TASK_TYPE_REGISTRY.length}件を登録した`,
    `Prompt pack作成: 全task typeをmanual copy前提で生成できる`,
    `Output format: ${AI_REVIEW_OUTPUT_FORMATS.length}テンプレートを用意した`,
    `Result intake guide: ${AI_RESULT_INTAKE_GUIDES.length}件を紐付けた`,
    `API execution candidate: ${AI_EXECUTION_CANDIDATE_DRAFTS.length}件をdraft-onlyで整理した`,
    'AI API呼び出しなし・API key入力欄なし・secret保存なしを維持した',
  ];

  const warnings = [
    'AIへ貼る内容は毎回人間がprivate情報を確認する必要がある',
    'api-candidate providerは将来候補であり、このPhaseではmanual copy only',
    'AI結果は提案であり、GitHub/App Store操作や審査判断は人間が最終決定する',
  ];

  const nextActions = [
    '各task typeで実際にコピーしやすいかスマホ幅で確認する',
    '出力フォーマットどおりに結果を戻せるか確認する',
    'future candidateとして外部secret管理方針を文書化する',
    '必要ならPhase 26の通知dry-runへ進む',
  ];

  return {
    title: 'Phase 25 AI Preparation Completion Report',
    status: blockers.length > 0 ? 'blocked' : 'ready-for-manual-ai-use',
    completed,
    warnings,
    blockers,
    nextRecommendedPhase: 'Phase 26: 実通知 dry-run',
    nextActions,
  };
}

export function formatAiPreparationCompletionReportMarkdown(
  report: AiPreparationCompletionReport,
): string {
  const lines: string[] = [`# ${report.title}`, `Status: ${report.status}`, '', '## Completed'];

  report.completed.forEach((item) => lines.push(`- ✅ ${item}`));
  lines.push('', '## Warnings');
  report.warnings.forEach((item) => lines.push(`- ⚠️ ${item}`));

  if (report.blockers.length > 0) {
    lines.push('', '## Blockers');
    report.blockers.forEach((item) => lines.push(`- 🔴 ${item}`));
  }

  lines.push('', '## Next Recommended Phase', report.nextRecommendedPhase, '', '## Next Actions');
  report.nextActions.forEach((item) => lines.push(`- ${item}`));

  return lines.join('\n');
}
