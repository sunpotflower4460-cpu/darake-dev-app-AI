import type { ManualAiReviewSession } from './manualAiReviewSession';

export type AiReviewLoopCompletionReport = {
  title: string;
  generatedAt: string;
  sessions: ManualAiReviewSession[];
  waitingResult: ManualAiReviewSession[];
  triaged: ManualAiReviewSession[];
  issueDrafted: ManualAiReviewSession[];
  cloudAgentReady: ManualAiReviewSession[];
  blockers: string[];
  nextActions: string[];
};

export function buildAiReviewLoopCompletionReport(
  sessions: ManualAiReviewSession[]
): AiReviewLoopCompletionReport {
  const waitingResult = sessions.filter(
    (s) => s.status === 'prompt-copied' || s.status === 'waiting-result'
  );
  const triaged = sessions.filter((s) => s.status === 'triaged');
  const issueDrafted = sessions.filter((s) => s.status === 'issue-drafted');
  const cloudAgentReady = sessions.filter((s) => s.status === 'done');

  const blockers: string[] = [];
  const nextActions: string[] = [];

  if (waitingResult.length > 0) {
    nextActions.push(`AI結果を待っているセッションが ${waitingResult.length}件あります。結果をペーストしてください。`);
  }
  if (sessions.filter((s) => s.status === 'result-pasted').length > 0) {
    nextActions.push('result-pastedのセッションをtriageしてください。');
  }
  if (triaged.length > 0) {
    nextActions.push(`triage済みのセッションが ${triaged.length}件あります。Cloud Agent指示書を作成してください。`);
  }
  if (nextActions.length === 0) {
    nextActions.push('新しいAIレビューセッションをdraftしてください。');
  }

  return {
    title: 'AI Review Loop Completion Report',
    generatedAt: new Date().toISOString(),
    sessions,
    waitingResult,
    triaged,
    issueDrafted,
    cloudAgentReady,
    blockers,
    nextActions,
  };
}

export function formatAiReviewLoopCompletionReportMarkdown(
  report: AiReviewLoopCompletionReport
): string {
  const lines: string[] = [
    `# ${report.title}`,
    `生成日時: ${report.generatedAt}`,
    '',
    `## Sessions (${report.sessions.length}件)`,
    ...report.sessions.map((s) => `- [${s.status}] ${s.title}`),
    '',
    `## Waiting Result (${report.waitingResult.length}件)`,
    ...(report.waitingResult.length > 0 ? report.waitingResult.map((s) => `- ⏳ ${s.title}`) : ['(なし)']),
    '',
    `## Triaged (${report.triaged.length}件)`,
    ...(report.triaged.length > 0 ? report.triaged.map((s) => `- ✅ ${s.title}`) : ['(なし)']),
    '',
    `## Issue Drafted (${report.issueDrafted.length}件)`,
    ...(report.issueDrafted.length > 0 ? report.issueDrafted.map((s) => `- 📝 ${s.title}`) : ['(なし)']),
    '',
    `## Cloud Agent Ready (${report.cloudAgentReady.length}件)`,
    ...(report.cloudAgentReady.length > 0 ? report.cloudAgentReady.map((s) => `- 🤖 ${s.title}`) : ['(なし)']),
    '',
    `## Blockers`,
    ...(report.blockers.length > 0 ? report.blockers.map((b) => `- ⛔ ${b}`) : ['(なし)']),
    '',
    `## Next Actions`,
    ...report.nextActions.map((a) => `- ${a}`),
  ];
  return lines.join('\n');
}
