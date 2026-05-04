import type { LowRiskPrCandidate } from './lowRiskPrCandidate';
import type { PrCreationPreview } from './prCreationPreview';

export type MergeCandidateConditionStatus = 'pass' | 'warn' | 'block';

export type MergeCandidateCondition = {
  id: string;
  label: string;
  status: MergeCandidateConditionStatus;
  detail: string;
};

export type LowRiskMergeCandidate = {
  title: string;
  status: 'not-ready' | 'blocked' | 'review-candidate' | 'candidate';
  message: string;
  canSuggestAutoMerge: boolean;
  nextActionLabel: string;
  conditions: MergeCandidateCondition[];
  requiredBeforeMerge: string[];
  blockedReasons: string[];
  cautionReasons: string[];
};

function condition(
  status: MergeCandidateConditionStatus,
  label: string,
  detail: string,
): MergeCandidateCondition {
  return {
    id: label,
    label,
    status,
    detail,
  };
}

export function buildLowRiskMergeCandidate(
  prCandidate: LowRiskPrCandidate,
  preview: PrCreationPreview,
): LowRiskMergeCandidate {
  const conditions: MergeCandidateCondition[] = [];
  const blockedReasons: string[] = [];
  const cautionReasons: string[] = [];

  const prCandidateReady = prCandidate.status === 'candidate' && prCandidate.canSuggestAutoCreation;
  conditions.push(
    condition(
      prCandidateReady ? 'pass' : prCandidate.status === 'blocked' ? 'block' : 'warn',
      'PR作成候補の状態',
      prCandidateReady
        ? '低リスクPR作成候補として通過しています。'
        : prCandidate.status === 'blocked'
          ? 'PR作成候補側でblockedがあるため、マージ候補にはできません。'
          : 'まだPR作成候補が確認つきのため、マージ候補は慎重扱いです。',
    ),
  );

  const hasNoHardStops = preview.hardStops.length === 0 && prCandidate.blockedReasons.length === 0;
  conditions.push(
    condition(
      hasNoHardStops ? 'pass' : 'block',
      '停止候補なし',
      hasNoHardStops
        ? 'hard stop / blocked reason はありません。'
        : 'hard stop または blocked reason が残っています。',
    ),
  );

  const hasNoCautions = preview.warnings.length === 0 && prCandidate.cautionReasons.length === 0;
  conditions.push(
    condition(
      hasNoCautions ? 'pass' : 'warn',
      '注意点の有無',
      hasNoCautions
        ? 'Batch Gateへ回す注意点はありません。'
        : '注意点があります。自動マージではなく、確認つき候補にします。',
    ),
  );

  const ciRequired = true;
  conditions.push(
    condition(
      ciRequired ? 'warn' : 'block',
      'CI成功待ち',
      'このアプリ内では実CI状態を直接確定しません。PR Watch / CI Watchでsuccess確認後にだけ候補化します。',
    ),
  );

  const snapshotRequired = true;
  conditions.push(
    condition(
      snapshotRequired ? 'warn' : 'block',
      'Snapshot成功待ち',
      'Snapshot / Review Watch / PR Watch の成功確認をマージ前条件に残します。',
    ),
  );

  const explicitSettingRequired = true;
  conditions.push(
    condition(
      explicitSettingRequired ? 'warn' : 'block',
      'ユーザー設定待ち',
      '将来、ユーザーが「低リスクは自動マージOK」と明示設定した場合だけ自動候補にします。',
    ),
  );

  for (const item of conditions) {
    if (item.status === 'block') blockedReasons.push(`${item.label}: ${item.detail}`);
    if (item.status === 'warn') cautionReasons.push(`${item.label}: ${item.detail}`);
  }

  const canSuggestAutoMerge = prCandidateReady && hasNoHardStops && hasNoCautions && blockedReasons.length === 0;

  if (canSuggestAutoMerge) {
    return {
      title: '低リスクPRの自動マージ候補',
      status: 'candidate',
      message: '作業内容だけを見るとマージ候補に近い状態です。ただしCI/Snapshot/ユーザー設定は必ず別途確認します。',
      canSuggestAutoMerge,
      nextActionLabel: 'マージ候補として表示できます',
      conditions,
      requiredBeforeMerge: [
        'CI success',
        'Typecheck success',
        'Build success',
        'Snapshot success',
        'CodeRabbit blockなし',
        'ユーザーが低リスク自動マージOKを明示設定',
      ],
      blockedReasons,
      cautionReasons,
    };
  }

  if (blockedReasons.length > 0) {
    return {
      title: '低リスクPRの自動マージ候補：停止',
      status: 'blocked',
      message: 'マージ候補にはできません。blocked条件を解消するか、手動確認へ回します。',
      canSuggestAutoMerge,
      nextActionLabel: '手動確認へ回す',
      conditions,
      requiredBeforeMerge: ['blocked条件の解消', '低リスク部分のみの分離', 'CI / Snapshot success'],
      blockedReasons,
      cautionReasons,
    };
  }

  return {
    title: '低リスクPRの自動マージ候補：確認つき候補',
    status: prCandidate.status === 'not-ready' ? 'not-ready' : 'review-candidate',
    message: 'マージ候補に近いですが、CI・Snapshot・ユーザー設定など、最後に確認すべき条件が残っています。',
    canSuggestAutoMerge,
    nextActionLabel: 'マージ前チェックリストへ残す',
    conditions,
    requiredBeforeMerge: [
      'CI success',
      'Typecheck success',
      'Build success',
      'Snapshot success',
      'レビューでblockなし',
      '自動マージ許可設定',
    ],
    blockedReasons,
    cautionReasons,
  };
}

export function formatLowRiskMergeCandidate(candidate: LowRiskMergeCandidate): string {
  return [
    `# ${candidate.title}`,
    '',
    candidate.message,
    '',
    `- status: ${candidate.status}`,
    `- canSuggestAutoMerge: ${candidate.canSuggestAutoMerge}`,
    `- nextAction: ${candidate.nextActionLabel}`,
    '',
    '## Conditions',
    ...candidate.conditions.map((item) => `- [${item.status}] ${item.label}: ${item.detail}`),
    '',
    '## Required Before Merge',
    ...candidate.requiredBeforeMerge.map((item) => `- ${item}`),
    '',
    '## Blocked Reasons',
    ...(candidate.blockedReasons.length > 0 ? candidate.blockedReasons.map((item) => `- ${item}`) : ['- なし']),
    '',
    '## Caution Reasons',
    ...(candidate.cautionReasons.length > 0 ? candidate.cautionReasons.map((item) => `- ${item}`) : ['- なし']),
  ].join('\n');
}
