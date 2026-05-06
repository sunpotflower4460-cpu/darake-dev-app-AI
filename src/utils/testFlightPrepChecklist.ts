export type TestFlightCheckItem = {
  id: string;
  label: string;
  status: 'success' | 'warn' | 'failed' | 'unchecked';
  notes: string;
};

export type TestFlightPrepChecklist = {
  items: TestFlightCheckItem[];
  updatedAt: string;
};

const STORAGE_KEY = 'darake.testFlightPrepChecklist.v1';

export const TESTFLIGHT_ITEM_DEFINITIONS: Array<{ id: string; label: string }> = [
  { id: 'build-exists', label: 'ビルドがある（Xcode archiveまたはCI artifact）' },
  { id: 'main-features', label: '主要機能が動作する' },
  { id: 'no-crash', label: 'クラッシュなし' },
  { id: 'login-test-account', label: 'ログインが必要ならテストアカウントがある' },
  { id: 'iap-sandbox', label: '課金があるならsandbox確認済み' },
  { id: 'no-private-info', label: 'private情報なし' },
  { id: 'review-notes', label: '審査メモがある' },
  { id: 'tester-scope', label: '外部テスターに出すか内部だけか確認済み' },
];

export function buildInitialTestFlightPrepChecklist(): TestFlightPrepChecklist {
  return {
    items: TESTFLIGHT_ITEM_DEFINITIONS.map((def) => ({
      id: def.id,
      label: def.label,
      status: 'unchecked',
      notes: '',
    })),
    updatedAt: '',
  };
}

export function loadTestFlightPrepChecklist(): TestFlightPrepChecklist {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialTestFlightPrepChecklist();
    return { ...buildInitialTestFlightPrepChecklist(), ...JSON.parse(raw) };
  } catch {
    return buildInitialTestFlightPrepChecklist();
  }
}

export function saveTestFlightPrepChecklist(checklist: TestFlightPrepChecklist): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...checklist, updatedAt: new Date().toISOString() }));
  } catch {
    // ignore
  }
}

export function clearTestFlightPrepChecklist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizeTestFlightPrepChecklist(checklist: TestFlightPrepChecklist): {
  status: 'ready' | 'needs-review' | 'blocked';
  failedItems: string[];
  uncheckedItems: string[];
  warnItems: string[];
} {
  const failedItems = checklist.items.filter((i) => i.status === 'failed').map((i) => i.label);
  const uncheckedItems = checklist.items.filter((i) => i.status === 'unchecked').map((i) => i.label);
  const warnItems = checklist.items.filter((i) => i.status === 'warn').map((i) => i.label);

  let status: 'ready' | 'needs-review' | 'blocked' = 'ready';
  if (failedItems.length > 0 || uncheckedItems.length > 0) status = 'blocked';
  else if (warnItems.length > 0) status = 'needs-review';

  return { status, failedItems, uncheckedItems, warnItems };
}

export function formatTestFlightPrepChecklist(checklist: TestFlightPrepChecklist): string {
  const lines: string[] = ['# TestFlight 準備チェック', ''];
  checklist.items.forEach((item) => {
    const icon =
      item.status === 'success' ? '✅' : item.status === 'warn' ? '⚠️' : item.status === 'failed' ? '🔴' : '❓';
    lines.push(`- ${icon} ${item.label}${item.notes ? `: ${item.notes}` : ''}`);
  });
  lines.push(
    '',
    '## Safety Note',
    '- TestFlightへのアップロードはXcodeまたはCIで人間が行います',
    '- 最終Submitは人間が行います',
  );
  return lines.join('\n');
}
