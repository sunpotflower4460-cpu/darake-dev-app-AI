import type { GeneratedPhasePlan } from './phasePlanGenerator';

export type IssueDraftBatch = {
  appName: string;
  issues: Array<{
    phaseId: string;
    title: string;
    body: string;
  }>;
};

export function generateIssueDraftBatch(appName: string, plan: GeneratedPhasePlan): IssueDraftBatch {
  const issues = plan.phases.map((phase) => {
    const title = `[${appName}][${phase.id}] ${phase.title}`;
    const body = [
      `## 概要`,
      phase.purpose,
      '',
      `## タスク`,
      ...phase.tasks.map((t) => `- [ ] ${t}`),
      '',
      `## 完了条件`,
      ...phase.doneConditions.map((d) => `- ${d}`),
      phase.manualGates.length > 0
        ? `\n## ⚠️ Manual Gate\n${phase.manualGates.map((g) => `- ${g}`).join('\n')}`
        : '',
      '',
      `## Safety Note`,
      `- App Store / Google Playへの本番操作は自動実行しません`,
      `- secret / token は保存しません`,
    ].join('\n');

    return { phaseId: phase.id, title, body };
  });

  return { appName, issues };
}

export function formatIssueDraftBatchAllMarkdown(batch: IssueDraftBatch): string {
  return batch.issues
    .map((issue) => [`# Issue: ${issue.title}`, '', issue.body, '', '---', ''].join('\n'))
    .join('\n');
}
