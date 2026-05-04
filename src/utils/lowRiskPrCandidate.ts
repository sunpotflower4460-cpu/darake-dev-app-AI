import type { PrCreationPreview, PrPreviewFilePlan } from './prCreationPreview';

export type LowRiskPrConditionStatus = 'pass' | 'warn' | 'block';

export type LowRiskPrCondition = {
  id: string;
  label: string;
  status: LowRiskPrConditionStatus;
  detail: string;
};

export type LowRiskPrCandidate = {
  title: string;
  status: 'not-ready' | 'blocked' | 'review-candidate' | 'candidate';
  message: string;
  canSuggestAutoCreation: boolean;
  nextActionLabel: string;
  conditions: LowRiskPrCondition[];
  suggestedChecklist: string[];
  blockedReasons: string[];
  cautionReasons: string[];
};

const riskyKeywords = [
  'secret',
  'token',
  'key',
  'apiキー',
  '認証',
  'auth',
  'login',
  'ログイン',
  '課金',
  'payment',
  'billing',
  'stripe',
  'db',
  'database',
  'firestore',
  'production',
  '本番',
  '公開',
  'security',
  '権限',
  'permission',
  'app store',
  'submit',
  '提出',
];

function includesRiskyKeyword(value: string): boolean {
  const normalized = value.toLowerCase();
  return riskyKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function summarizeCondition(status: LowRiskPrConditionStatus, label: string, detail: string): LowRiskPrCondition {
  return {
    id: label,
    label,
    status,
    detail,
  };
}

function hasOnlySafeFiles(filePlan: PrPreviewFilePlan[]): boolean {
  return filePlan.every((item) => item.risk === 'safe-auto');
}

function hasRiskyFileNames(filePlan: PrPreviewFilePlan[]): boolean {
  return filePlan.some((item) => includesRiskyKeyword(item.path));
}

export function buildLowRiskPrCandidate(preview: PrCreationPreview): LowRiskPrCandidate {
  const conditions: LowRiskPrCondition[] = [];
  const blockedReasons: string[] = [];
  const cautionReasons: string[] = [];

  const previewReady = preview.status === 'low-risk-candidate' && preview.canCreateAutomatically;
  conditions.push(
    summarizeCondition(
      previewReady ? 'pass' : preview.status === 'blocked' ? 'block' : 'warn',
      'PRプレビュー状態',
      previewReady
        ? '低リスクPR候補として扱えます。'
        : preview.status === 'blocked'
          ? 'blocked項目があるため、自動作成候補にはできません。'
          : 'まだPR作成候補ではなく、確認用プレビューです。',
    ),
  );

  const safeFilesOnly = hasOnlySafeFiles(preview.filePlan);
  conditions.push(
    summarizeCondition(
      safeFilesOnly ? 'pass' : 'warn',
      '作業候補の安全度',
      safeFilesOnly
        ? 'File / Work Planはsafe-autoのみです。'
        : 'review-neededやmanual-gateが含まれるため、PR本文で確認項目として残します。',
    ),
  );

  const fileCountOk = preview.filePlan.length > 0 && preview.filePlan.length <= 12;
  conditions.push(
    summarizeCondition(
      fileCountOk ? 'pass' : 'warn',
      '変更候補の量',
      fileCountOk
        ? `候補数は${preview.filePlan.length}件で、低リスクPRとして見渡せる量です。`
        : `候補数は${preview.filePlan.length}件です。大きすぎる場合は分割候補にします。`,
    ),
  );

  const riskyNames = hasRiskyFileNames(preview.filePlan);
  conditions.push(
    summarizeCondition(
      riskyNames ? 'block' : 'pass',
      '危険語の検知',
      riskyNames
        ? 'secret / token / 認証 / 課金 / 本番公開などに近い語が含まれます。'
        : 'secret / token / 認証 / 課金 / 本番公開に近い語は見つかっていません。',
    ),
  );

  const hasHardStops = preview.hardStops.length > 0;
  conditions.push(
    summarizeCondition(
      hasHardStops ? 'block' : 'pass',
      '途中停止候補',
      hasHardStops
        ? '途中停止候補があります。自動作成候補から外します。'
        : '途中停止候補はありません。',
    ),
  );

  const hasWarnings = preview.warnings.length > 0;
  conditions.push(
    summarizeCondition(
      hasWarnings ? 'warn' : 'pass',
      '最後にまとめる注意点',
      hasWarnings
        ? '注意点があります。Batch Gate Modeでは最後にまとめます。'
        : '最後にまとめる注意点はありません。',
    ),
  );

  for (const condition of conditions) {
    if (condition.status === 'block') blockedReasons.push(`${condition.label}: ${condition.detail}`);
    if (condition.status === 'warn') cautionReasons.push(`${condition.label}: ${condition.detail}`);
  }

  const canSuggestAutoCreation = blockedReasons.length === 0 && previewReady && safeFilesOnly && fileCountOk && !riskyNames;

  if (canSuggestAutoCreation) {
    return {
      title: '低リスクPRの自動作成候補',
      status: 'candidate',
      message: '条件はかなり安全側です。次段階では「候補として提示」から「明示承認後に作成」へ進められます。',
      canSuggestAutoCreation,
      nextActionLabel: 'PR作成候補として表示できます',
      conditions,
      suggestedChecklist: [
        'PR作成前に差分がPhase目的内か見る',
        'CI / Typecheck / Buildの成功を待つ',
        'スクショ確認はPhase 10で合流予定',
        '自動作成は次段階でも明示ゲート付きにする',
      ],
      blockedReasons,
      cautionReasons,
    };
  }

  if (blockedReasons.length > 0) {
    return {
      title: '低リスクPRの自動作成候補：停止',
      status: 'blocked',
      message: '自動作成候補にはできません。blocked条件を分離するか、手動ゲートへ回します。',
      canSuggestAutoCreation,
      nextActionLabel: '手動ゲートへ回す',
      conditions,
      suggestedChecklist: ['blocked条件を別Issueへ分ける', '危険語を含む作業を手動確認へ回す', '低リスク部分だけでPR候補を作り直す'],
      blockedReasons,
      cautionReasons,
    };
  }

  return {
    title: '低リスクPRの自動作成候補：確認つき候補',
    status: preview.status === 'not-ready' ? 'not-ready' : 'review-candidate',
    message: 'PR作成候補に近いですが、まだ注意点があります。Batch Gate Modeでは最後にまとめる確認として扱います。',
    canSuggestAutoCreation,
    nextActionLabel: 'PR本文へ確認項目を残す',
    conditions,
    suggestedChecklist: ['注意点をPR本文に残す', '作業量が多ければ分割する', '次段階でも実行ボタンは追加しない'],
    blockedReasons,
    cautionReasons,
  };
}

export function formatLowRiskPrCandidate(candidate: LowRiskPrCandidate): string {
  return [
    `# ${candidate.title}`,
    '',
    candidate.message,
    '',
    `- status: ${candidate.status}`,
    `- canSuggestAutoCreation: ${candidate.canSuggestAutoCreation}`,
    `- nextAction: ${candidate.nextActionLabel}`,
    '',
    '## Conditions',
    ...candidate.conditions.map((condition) => `- [${condition.status}] ${condition.label}: ${condition.detail}`),
    '',
    '## Blocked Reasons',
    ...(candidate.blockedReasons.length > 0 ? candidate.blockedReasons.map((item) => `- ${item}`) : ['- なし']),
    '',
    '## Caution Reasons',
    ...(candidate.cautionReasons.length > 0 ? candidate.cautionReasons.map((item) => `- ${item}`) : ['- なし']),
    '',
    '## Suggested Checklist',
    ...candidate.suggestedChecklist.map((item) => `- ${item}`),
  ].join('\n');
}
