import { getDarakeV1Requirements } from './darakeV1Definition';
import type { DarakeV1Requirement } from './darakeV1Definition';

export type DarakeV1ReadinessStatus = 'ready-for-v1' | 'needs-review' | 'blocked';

export type DarakeV1ReadinessGate = {
  title: string;
  status: DarakeV1ReadinessStatus;
  requirements: DarakeV1Requirement[];
  blockers: string[];
  warnings: string[];
  finalHumanCheck: string[];
  summary: string;
};

export function buildDarakeV1ReadinessGate(
  requirements?: DarakeV1Requirement[],
): DarakeV1ReadinessGate {
  const reqs = requirements ?? getDarakeV1Requirements();

  const blockers = reqs
    .filter((r) => r.required && r.status === 'blocked')
    .map((r) => r.label);

  const warnings = reqs
    .filter((r) => r.status === 'needs-review')
    .map((r) => r.label);

  const status: DarakeV1ReadinessStatus =
    blockers.length > 0
      ? 'blocked'
      : warnings.length > 0
        ? 'needs-review'
        : 'ready-for-v1';

  const finalHumanCheck: string[] = [
    'blockedが常に表示されているか確認',
    '外部API実行処理がないか確認',
    'secret / token 保存処理がないか確認',
    'スマホ幅で情報過多でないか確認',
    'Final Formが主役になっているか確認',
  ];

  const lines = [
    '# だらけ管制室 v1 Readiness Gate (Phase 44)',
    '',
    `**状態**: ${status === 'ready-for-v1' ? '✅ v1準備完了' : status === 'needs-review' ? '⚠️ 要確認' : '🚫 ブロック中'}`,
    '',
    `**必須条件 合計**: ${reqs.filter((r) => r.required).length}件`,
    `**完了**: ${reqs.filter((r) => r.status === 'done').length}件`,
    `**要確認**: ${warnings.length}件`,
    `**ブロック**: ${blockers.length}件`,
    '',
  ];

  if (blockers.length > 0) {
    lines.push('## 🚫 ブロック中（必ず解消）');
    blockers.forEach((b) => lines.push(`- ${b}`));
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push('## ⚠️ 要確認');
    warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push('');
  }

  lines.push('## 最後の人間確認');
  finalHumanCheck.forEach((c) => lines.push(`- ${c}`));

  return {
    title: 'だらけ管制室 v1 Readiness Gate',
    status,
    requirements: reqs,
    blockers,
    warnings,
    finalHumanCheck,
    summary: lines.join('\n'),
  };
}
