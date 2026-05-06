import { detectFrictionItems } from './frictionDetector';
import type { FrictionItem } from './frictionDetector';

export type FrictionCutAction =
  | 'hide-by-default'
  | 'move-to-review-inbox'
  | 'batch-warning'
  | 'collapse-details'
  | 'merge-cards'
  | 'reduce-copy'
  | 'make-one-recommendation'
  | 'keep-for-safety';

export type FrictionCutEntry = {
  id: string;
  label: string;
  action: FrictionCutAction;
  reason: string;
  expectedDarakeGain: 'small' | 'medium' | 'large';
};

export type FrictionCutPlan = {
  title: string;
  status: 'ready' | 'needs-review' | 'blocked';
  cuts: FrictionCutEntry[];
  doNotCut: string[];
  summary: string;
};

// Items that must never be cut
const DO_NOT_CUT: string[] = [
  'blocked状態',
  'secret未設定の警告',
  'production risk警告',
  'App Store Submit操作',
  '課金・billing',
  '認証・auth',
  'DB変更',
  'CI / build失敗',
  'プライベート情報の警告',
  '本番デプロイ確認',
];

function frictionItemToCutEntry(item: FrictionItem): FrictionCutEntry {
  let action: FrictionCutAction;
  let reason: string;
  let gain: 'small' | 'medium' | 'large';

  if (item.mustKeepVisibleForSafety) {
    action = 'keep-for-safety';
    reason = '安全上、常に表示が必要';
    gain = 'small';
  } else if (item.type === 'details-shown-too-early' || item.type === 'too-much-text') {
    action = 'collapse-details';
    reason = '詳細は折りたたみ、コピーボタンを前面に出す';
    gain = item.severity === 'high' ? 'large' : 'medium';
  } else if (item.type === 'safe-item-visible') {
    action = 'hide-by-default';
    reason = '安全な項目はデフォルト非表示にする';
    gain = item.severity === 'high' ? 'large' : 'medium';
  } else if (item.type === 'warning-not-batched') {
    action = 'batch-warning';
    reason = '警告はMorning Reportにまとめる';
    gain = 'medium';
  } else if (item.type === 'too-many-panels') {
    action = 'hide-by-default';
    reason = '重要パネル以外はデフォルト非表示にする';
    gain = 'large';
  } else if (item.type === 'requires-repeated-ok' || item.type === 'requires-unneeded-choice') {
    action = 'make-one-recommendation';
    reason = '選択肢を1つのおすすめに絞る';
    gain = 'medium';
  } else if (item.type === 'manual-gate-too-noisy') {
    action = 'move-to-review-inbox';
    reason = '手動ゲートはReview Inboxへ移動';
    gain = 'medium';
  } else {
    action = 'reduce-copy';
    reason = '不要な文章を削る';
    gain = 'small';
  }

  return {
    id: `cut-${item.id}`,
    label: item.label,
    action,
    reason,
    expectedDarakeGain: gain,
  };
}

export function buildFrictionCutPlan(items?: FrictionItem[]): FrictionCutPlan {
  const frictionItems = items ?? detectFrictionItems();
  const cuts = frictionItems.map(frictionItemToCutEntry);

  const hasHighSeverity = frictionItems.some((f) => f.severity === 'high' && !f.mustKeepVisibleForSafety);
  const status: FrictionCutPlan['status'] = hasHighSeverity ? 'needs-review' : 'ready';

  const lines = [
    '# Friction Cut Plan (Phase 43)',
    '',
    `**状態**: ${status === 'ready' ? '✅ 実行準備OK' : '⚠️ 要確認'}`,
    `**削る対象**: ${cuts.filter((c) => c.action !== 'keep-for-safety').length}件`,
    `**安全上残す**: ${cuts.filter((c) => c.action === 'keep-for-safety').length}件`,
    '',
    '## 削る候補',
    ...cuts
      .filter((c) => c.action !== 'keep-for-safety')
      .map((c) => `- [${c.expectedDarakeGain}] ${c.label} → ${c.action}`),
    '',
    '## 削らないもの',
    ...DO_NOT_CUT.map((d) => `- ${d}`),
  ];

  return {
    title: 'Friction Cut Plan',
    status,
    cuts,
    doNotCut: DO_NOT_CUT,
    summary: lines.join('\n'),
  };
}
