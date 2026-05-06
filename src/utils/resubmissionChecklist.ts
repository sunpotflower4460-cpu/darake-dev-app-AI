export type ResubmissionCheckItem = {
  id: string;
  label: string;
  status: 'success' | 'warn' | 'failed' | 'unchecked';
  notes: string;
};

export type ResubmissionChecklist = {
  items: ResubmissionCheckItem[];
  updatedAt: string;
};

const STORAGE_KEY = 'darake.resubmissionChecklist.v1';

export const RESUBMISSION_ITEM_DEFINITIONS: Array<{ id: string; label: string }> = [
  { id: 'apple-response-addressed', label: 'Appleの指摘に対応済み' },
  { id: 'fix-pr-merged', label: '修正PRがmergeされた' },
  { id: 'build-rebuilt', label: '再ビルドが完了した' },
  { id: 'metadata-updated', label: 'メタデータを更新した（必要な場合）' },
  { id: 'privacy-updated', label: 'プライバシー設定を更新した（必要な場合）' },
  { id: 'screenshots-updated', label: 'スクショを更新した（必要な場合）' },
  { id: 'review-response-ready', label: 'Appleへの返信文が準備できた（必要な場合）' },
  { id: 'final-gate-rechecked', label: '最終提出ゲート（Phase 13.5）を再確認した' },
];

export function buildInitialResubmissionChecklist(): ResubmissionChecklist {
  return {
    items: RESUBMISSION_ITEM_DEFINITIONS.map((def) => ({
      id: def.id,
      label: def.label,
      status: 'unchecked',
      notes: '',
    })),
    updatedAt: '',
  };
}

export function loadResubmissionChecklist(): ResubmissionChecklist {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialResubmissionChecklist();
    return { ...buildInitialResubmissionChecklist(), ...JSON.parse(raw) };
  } catch {
    return buildInitialResubmissionChecklist();
  }
}

export function saveResubmissionChecklist(checklist: ResubmissionChecklist): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...checklist, updatedAt: new Date().toISOString() }));
  } catch {
    // ignore
  }
}

export function clearResubmissionChecklist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizeResubmissionChecklist(checklist: ResubmissionChecklist): {
  status: 'ready' | 'needs-review' | 'blocked';
  failedItems: string[];
  uncheckedItems: string[];
} {
  const failedItems = checklist.items.filter((i) => i.status === 'failed').map((i) => i.label);
  const uncheckedItems = checklist.items.filter((i) => i.status === 'unchecked').map((i) => i.label);

  let status: 'ready' | 'needs-review' | 'blocked' = 'ready';
  if (failedItems.length > 0 || uncheckedItems.length > 0) status = 'blocked';

  return { status, failedItems, uncheckedItems };
}

export function formatResubmissionChecklist(checklist: ResubmissionChecklist): string {
  const lines: string[] = ['# 再提出チェックリスト', ''];
  checklist.items.forEach((item) => {
    const icon =
      item.status === 'success' ? '✅' : item.status === 'warn' ? '⚠️' : item.status === 'failed' ? '🔴' : '❓';
    lines.push(`- ${icon} ${item.label}${item.notes ? `: ${item.notes}` : ''}`);
  });
  lines.push(
    '',
    '## Safety Note',
    '- 再提出（Submit for Review）は人間が行います',
    '- Appleへの返信は人間が行います',
  );
  return lines.join('\n');
}
