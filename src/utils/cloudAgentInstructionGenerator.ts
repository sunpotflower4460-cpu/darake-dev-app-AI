import type { GeneratedPhasePlan } from './phasePlanGenerator';

export type CloudAgentInstruction = {
  phaseId: string;
  phaseTitle: string;
  instruction: string;
  prBodyTemplate: string;
  safetyPolicy: string[];
  checkPoints: string[];
  prohibited: string[];
  doneConditions: string[];
};

export function generateCloudAgentInstruction(
  appName: string,
  phase: GeneratedPhasePlan['phases'][number],
): CloudAgentInstruction {
  const instruction = [
    `# Cloud Agent 指示書: ${appName} / ${phase.title}`,
    '',
    `## タスク`,
    phase.purpose,
    '',
    `## 実装内容`,
    ...phase.tasks.map((t) => `- ${t}`),
    '',
    `## 完了条件`,
    ...phase.doneConditions.map((d) => `- ${d}`),
    '',
    phase.manualGates.length > 0
      ? `## ⚠️ Manual Gate\n${phase.manualGates.map((g) => `- ${g}`).join('\n')}\n`
      : '',
    `## 禁止事項`,
    `- App Store / Google Play への本番操作を自動実行しない`,
    `- secret / token / API key を保存しない`,
    `- 本番DB変更を自動実行しない`,
    `- GitHub Issueを自動作成しない（下書きコピーのみ）`,
  ].join('\n');

  const prBodyTemplate = [
    `## 概要`,
    `${appName} の ${phase.title} を追加しました。`,
    '',
    `## 追加内容`,
    ...phase.tasks.map((t) => `- ${t}`),
    '',
    `## 安全方針`,
    `- 外部APIは呼びません`,
    `- secret / token / API key は保存しません`,
    `- GitHub / App Store / deploy の本番操作は自動実行しません`,
    `- manual gateが必要な操作は候補表示とコピーだけにします`,
    '',
    `## 確認ポイント`,
    `- npm run typecheck`,
    `- npm run build`,
    `- スマホ幅表示`,
    `- コピー機能`,
  ].join('\n');

  return {
    phaseId: phase.id,
    phaseTitle: phase.title,
    instruction,
    prBodyTemplate,
    safetyPolicy: [
      'App Store / Google Play への操作は自動実行しない',
      'secret / token / API key を保存しない',
      '本番DB変更を自動実行しない',
    ],
    checkPoints: ['typecheck通過', 'build通過', 'スマホ幅確認', 'コピー機能確認'],
    prohibited: [
      'App Store Connect APIの自動呼び出し',
      'secret保存',
      'GitHub Issue自動作成',
      'deploy自動実行',
    ],
    doneConditions: phase.doneConditions,
  };
}

export function generateAllCloudAgentInstructions(
  appName: string,
  phases: GeneratedPhasePlan['phases'],
): CloudAgentInstruction[] {
  return phases.map((p) => generateCloudAgentInstruction(appName, p));
}
