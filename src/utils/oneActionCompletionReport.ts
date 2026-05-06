import type { OneActionCandidate } from './oneActionCandidate';
import type { OneActionDecisionRecord } from './oneActionDecisionRecord';

export type OneActionCompletionReport = {
  title: string;
  status: 'ready' | 'needs-review' | 'blocked';
  currentCandidate: OneActionCandidate | null;
  recentDecisions: OneActionDecisionRecord[];
  completed: string[];
  blockers: string[];
  warnings: string[];
  nextActions: string[];
};

export function buildOneActionCompletionReport(
  candidates: OneActionCandidate[],
  decisions: OneActionDecisionRecord[],
  currentCandidate: OneActionCandidate | null
): OneActionCompletionReport {
  const recentDecisions = decisions.slice(0, 10);
  const completed = decisions
    .filter((d) => d.decision === 'ok')
    .map((d) => `✅ ${d.candidateId} (${d.decidedAt.slice(0, 10)})`);
  const blockers = candidates
    .filter((c) => c.status === 'blocked')
    .flatMap((c) => c.blockers);
  const warnings = candidates
    .filter((c) => c.status !== 'blocked')
    .flatMap((c) => c.warnings);

  const followUpNeeded = decisions
    .filter((d) => d.followUpNeeded)
    .map((d) => `⚠️ フォローアップ必要: ${d.candidateId}`);

  const nextActions: string[] = [
    ...followUpNeeded,
    ...(currentCandidate
      ? [`👉 次の候補: ${currentCandidate.title}`]
      : ['候補がありません。新しい候補を追加してください。']),
  ];

  const status: OneActionCompletionReport['status'] =
    blockers.length > 0
      ? 'blocked'
      : warnings.length > 0
        ? 'needs-review'
        : 'ready';

  return {
    title: 'One Action Completion Report',
    status,
    currentCandidate,
    recentDecisions,
    completed,
    blockers,
    warnings,
    nextActions,
  };
}

export function formatOneActionCompletionReportMarkdown(
  report: OneActionCompletionReport
): string {
  const lines = [
    `# ${report.title}`,
    '',
    `**status:** ${report.status}`,
    '',
  ];
  if (report.currentCandidate) {
    lines.push(
      `## 今の候補`,
      `- ${report.currentCandidate.title} (${report.currentCandidate.kind})`
    );
  }
  if (report.completed.length > 0) {
    lines.push('', '## 完了済み');
    report.completed.forEach((c) => lines.push(c));
  }
  if (report.blockers.length > 0) {
    lines.push('', '## Blockers');
    report.blockers.forEach((b) => lines.push(`- ${b}`));
  }
  if (report.warnings.length > 0) {
    lines.push('', '## Warnings');
    report.warnings.forEach((w) => lines.push(`- ${w}`));
  }
  if (report.nextActions.length > 0) {
    lines.push('', '## 次のアクション');
    report.nextActions.forEach((n) => lines.push(`- ${n}`));
  }
  return lines.join('\n');
}
