import type { CloudAgentJob } from './cloudAgentJob';
import type { CloudAgentResultRecord } from './cloudAgentResultRecord';

export type CloudAgentRetryInstruction = {
  title: string;
  status: 'blocked' | 'ready-to-copy' | 'needs-review';
  retryInstruction: string;
  keepItems: string[];
  fixItems: string[];
  doNotTouchItems: string[];
  doneConditions: string[];
  riskNotes: string[];
};

export function buildCloudAgentRetryInstruction(params: {
  originalJob: CloudAgentJob;
  resultRecord: CloudAgentResultRecord;
  failedChecks: string[];
  codeRabbitNotes: string;
  userNotes: string;
}): CloudAgentRetryInstruction {
  const { originalJob, resultRecord, failedChecks, codeRabbitNotes, userNotes } = params;

  const fixItems: string[] = [
    ...failedChecks.map((c) => `修正: ${c}`),
    ...(codeRabbitNotes ? [`CodeRabbit指摘対応: ${codeRabbitNotes}`] : []),
    ...(userNotes ? [`ユーザー指示: ${userNotes}`] : []),
  ];

  const retryInstruction = [
    `# Cloud Agent 再指示: ${originalJob.title}`,
    '',
    `Phase: ${originalJob.phaseLabel}`,
    `repo: ${originalJob.targetRepo}`,
    '',
    `## 前回の結果`,
    `status: ${resultRecord.status}`,
    resultRecord.summary ? `summary: ${resultRecord.summary}` : '',
    '',
    `## 今回修正してほしいこと`,
    ...fixItems.map((f) => `- ${f}`),
    '',
    `## 変えないでほしいこと`,
    ...originalJob.doneConditions.map((d) => `- ${d}`),
    '',
    `## 安全ルール`,
    ...originalJob.safetyRules.map((r) => `- ⛔ ${r}`),
  ]
    .filter((l) => l !== '')
    .join('\n');

  return {
    title: `Retry: ${originalJob.title}`,
    status: fixItems.length > 0 ? 'ready-to-copy' : 'needs-review',
    retryInstruction,
    keepItems: originalJob.doneConditions,
    fixItems,
    doNotTouchItems: ['secret / token / API key', '本番deploy処理', ...originalJob.safetyRules],
    doneConditions: originalJob.doneConditions,
    riskNotes: [`前回失敗: ${resultRecord.status}`],
  };
}

export function formatCloudAgentRetryInstructionMarkdown(instruction: CloudAgentRetryInstruction): string {
  return instruction.retryInstruction;
}
