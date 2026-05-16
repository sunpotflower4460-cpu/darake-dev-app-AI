export type AgentTarget = 'cloud-agent' | 'codex' | 'copilot' | 'generic';

export type AgentInstructionFormat = {
  target: AgentTarget;
  purpose: string;
  scope: string;
  touchableFiles: string[];
  doNotTouchFiles: string[];
  checkPoints: string[];
  doneConditions: string[];
  prTitle: string;
  prBody: string;
  safetyPolicy: string[];
};

const ALWAYS_DO_NOT_TOUCH = [
  '.env',
  'wrangler.toml (secret values)',
  '本番DB設定',
  'App Store Connect認証情報',
];

const ALWAYS_SAFETY_POLICY = [
  'secret / token / API key を保存しない',
  'App Store / Google Play への本番操作を自動実行しない',
  '本番DBを直接変更しない',
  'mainブランチへの直接プッシュをしない',
  '大規模リファクタは行わない',
];

export function buildAgentInstructionFormat(input: {
  target: AgentTarget;
  appName: string;
  phaseTitle: string;
  purpose: string;
  scope: string;
  touchableFiles?: string[];
  doNotTouchFiles?: string[];
  checkPoints?: string[];
  doneConditions?: string[];
}): AgentInstructionFormat {
  const prTitle = `[${input.appName}] ${input.phaseTitle}`;
  const doNotTouch = [...ALWAYS_DO_NOT_TOUCH, ...(input.doNotTouchFiles ?? [])];

  const prBody = [
    `## 概要`,
    input.purpose,
    '',
    `## 作業範囲`,
    input.scope,
    '',
    input.touchableFiles?.length
      ? `## 触ってよいファイル\n${input.touchableFiles.map((f) => `- ${f}`).join('\n')}\n`
      : '',
    `## 触らないファイル`,
    ...doNotTouch.map((f) => `- ${f}`),
    '',
    `## 確認項目`,
    ...(input.checkPoints ?? ['npm run typecheck', 'npm run build', 'スマホ幅での動作確認']).map(
      (c) => `- [ ] ${c}`,
    ),
    '',
    `## 完了条件`,
    ...(input.doneConditions ?? []).map((d) => `- ${d}`),
    '',
    `## 安全方針`,
    ...ALWAYS_SAFETY_POLICY.map((p) => `- ${p}`),
  ].join('\n');

  return {
    target: input.target,
    purpose: input.purpose,
    scope: input.scope,
    touchableFiles: input.touchableFiles ?? [],
    doNotTouchFiles: doNotTouch,
    checkPoints: input.checkPoints ?? ['npm run typecheck', 'npm run build'],
    doneConditions: input.doneConditions ?? [],
    prTitle,
    prBody,
    safetyPolicy: ALWAYS_SAFETY_POLICY,
  };
}

export function agentTargetLabel(target: AgentTarget): string {
  const labels: Record<AgentTarget, string> = {
    'cloud-agent': 'Cloud Agent',
    codex: 'Codex',
    copilot: 'Copilot',
    generic: '汎用AIエージェント',
  };
  return labels[target];
}
