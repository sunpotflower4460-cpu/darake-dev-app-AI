import { loadGentleAppStartForm } from './gentleAppStartForm';
import { buildGentleFormToBlueprintBridge } from './gentleFormToBlueprintBridge';

export type PonStartPackStatus =
  | 'not-ready'
  | 'ready-to-copy'
  | 'needs-review';

export type PonStartPack = {
  title: string;
  status: PonStartPackStatus;
  appName: string;
  summary: string;
  included: {
    productBrief: boolean;
    phasePlan: boolean;
    cloudAgentInstruction: boolean;
    issueDraft: boolean;
    safetyRules: boolean;
    firstReviewChecklist: boolean;
  };
  productBriefMarkdown: string;
  phasePlanMarkdown: string;
  cloudAgentInstructionMarkdown: string;
  issueDraftMarkdown: string;
  allInOneMarkdown: string;
  nextHumanAction: string;
  warnings: string[];
  blockers: string[];
};

const SAFETY_RULES_MARKDOWN = `# 安全ルール

- GitHub APIは実行しません
- App Store APIは実行しません
- AI APIは呼びません
- workflow dispatchはしません
- secret / token / API key は保存しません
- ぽん開始は生成とコピーだけです
- 本番deploy / publish / 課金 / 認証 / DB変更は行いません
`;

const FIRST_REVIEW_CHECKLIST_MARKDOWN = `# 最初のレビューチェックリスト

- [ ] アプリ名が決まっている
- [ ] やることが1〜3項目に絞れている
- [ ] 技術スタックが決まっている
- [ ] Cloud Agentに渡す指示書がある
- [ ] やらないことが明確になっている
- [ ] secret・API keyがない
`;

export function buildPonStartPack(): PonStartPack {
  const form = loadGentleAppStartForm();
  const bridge = buildGentleFormToBlueprintBridge(form);

  const blockers = [...bridge.blockers];
  const warnings = [...bridge.warnings];

  let status: PonStartPackStatus;
  if (blockers.length > 0) {
    status = 'not-ready';
  } else if (warnings.length > 0) {
    status = 'needs-review';
  } else {
    status = 'ready-to-copy';
  }

  const appName = form?.appName || 'アプリ';

  const phasePlanMarkdown = [
    `# Phase計画 — ${appName}`,
    '',
    ...bridge.suggestedPhases.map((p) => [
      `## ${p.title}`,
      `**目的**: ${p.purpose}`,
      '',
      '**完了条件**:',
      ...p.doneConditions.map((c) => `- [ ] ${c}`),
      '',
    ].join('\n')),
  ].join('\n');

  const issueDraftMarkdown = `# ${bridge.issueDraftTitle}\n\n${bridge.issueDraftBody}`;

  const included = {
    productBrief: bridge.productBrief.length > 0,
    phasePlan: bridge.suggestedPhases.length > 0,
    cloudAgentInstruction: bridge.cloudAgentFirstInstruction.length > 0,
    issueDraft: bridge.issueDraftTitle.length > 0,
    safetyRules: true,
    firstReviewChecklist: true,
  };

  const allInOneMarkdown = [
    bridge.productBrief,
    '',
    '---',
    '',
    phasePlanMarkdown,
    '',
    '---',
    '',
    bridge.cloudAgentFirstInstruction,
    '',
    '---',
    '',
    issueDraftMarkdown,
    '',
    '---',
    '',
    SAFETY_RULES_MARKDOWN,
    '',
    '---',
    '',
    FIRST_REVIEW_CHECKLIST_MARKDOWN,
  ].join('\n');

  const nextHumanAction =
    status === 'ready-to-copy'
      ? 'Cloud Agentに指示書を貼るだけです'
      : status === 'needs-review'
      ? '確認事項を解消してからコピーしてください'
      : 'やさしいフォームの必須項目を入力してください';

  const summary = form
    ? `${appName} — ${form.oneLineIdea || '（内容未入力）'}`
    : '（フォーム未入力）';

  return {
    title: `ぽん開始パック — ${appName}`,
    status,
    appName,
    summary,
    included,
    productBriefMarkdown: bridge.productBrief,
    phasePlanMarkdown,
    cloudAgentInstructionMarkdown: bridge.cloudAgentFirstInstruction,
    issueDraftMarkdown,
    allInOneMarkdown,
    nextHumanAction,
    warnings,
    blockers,
  };
}

export function formatPonStartPack(pack: PonStartPack): string {
  return pack.allInOneMarkdown;
}

export function summarizePonStartPack(pack: PonStartPack): string {
  const statusLabel =
    pack.status === 'ready-to-copy'
      ? '✅ コピー準備OK'
      : pack.status === 'needs-review'
      ? '🔍 要確認'
      : '🚫 未準備';
  return `${pack.title} — ${statusLabel}`;
}
