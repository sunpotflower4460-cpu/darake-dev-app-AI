// Phase 34.2: Silent Batch Log

export type SilentBatchLogItem = {
  id: string;
  category:
    | 'auto-generated'
    | 'warning-batched'
    | 'manual-gate-queued'
    | 'blocked'
    | 'report-updated'
    | 'instruction-generated';
  title: string;
  summary: string;
  severity: 'info' | 'success' | 'warning' | 'manual-gate' | 'blocked';
  createdAt: string;
  visibleInSummary: boolean;
};

export const CATEGORY_LABELS: Record<SilentBatchLogItem['category'], string> = {
  'auto-generated': '自動生成',
  'warning-batched': 'warningまとめ',
  'manual-gate-queued': 'manual gateキュー',
  'blocked': 'ブロック',
  'report-updated': 'レポート更新',
  'instruction-generated': '指示書生成',
};

export const SEVERITY_ICONS: Record<SilentBatchLogItem['severity'], string> = {
  'info': 'ℹ️',
  'success': '✅',
  'warning': '⚠️',
  'manual-gate': '🔒',
  'blocked': '🚫',
};

export function buildSilentBatchLogItem(
  partial: Partial<SilentBatchLogItem> & Pick<SilentBatchLogItem, 'category' | 'title' | 'summary'>
): SilentBatchLogItem {
  return {
    id: `sbl-${crypto.randomUUID()}`,
    severity: 'info',
    createdAt: new Date().toISOString(),
    visibleInSummary: true,
    ...partial,
  };
}

export function formatSilentBatchLogMarkdown(items: SilentBatchLogItem[]): string {
  const lines = [
    `# Silent Batch Log`,
    '',
    `合計: ${items.length}件`,
    `blocked: ${items.filter((i) => i.severity === 'blocked').length}`,
    `manual gate: ${items.filter((i) => i.severity === 'manual-gate').length}`,
    `warning: ${items.filter((i) => i.severity === 'warning').length}`,
    '',
  ];

  // Show blocked first
  const blocked = items.filter((i) => i.severity === 'blocked');
  if (blocked.length > 0) {
    lines.push('## 🚫 ブロック');
    blocked.forEach((i) => {
      lines.push(`- **${i.title}**: ${i.summary}`);
    });
    lines.push('');
  }

  const manualGate = items.filter((i) => i.severity === 'manual-gate');
  if (manualGate.length > 0) {
    lines.push('## 🔒 Manual Gate（キュー）');
    manualGate.forEach((i) => {
      lines.push(`- **${i.title}**: ${i.summary}`);
    });
    lines.push('');
  }

  const warnings = items.filter((i) => i.severity === 'warning');
  if (warnings.length > 0) {
    lines.push('## ⚠️ Warningまとめ');
    warnings.forEach((i) => {
      lines.push(`- **${i.title}**: ${i.summary}`);
    });
    lines.push('');
  }

  const rest = items.filter(
    (i) => i.severity !== 'blocked' && i.severity !== 'manual-gate' && i.severity !== 'warning'
  );
  if (rest.length > 0) {
    lines.push('## ✅ 裏で進んだもの');
    rest.forEach((i) => {
      lines.push(`- ${SEVERITY_ICONS[i.severity]} **${i.title}**: ${i.summary}`);
    });
  }

  return lines.join('\n');
}

const STORAGE_KEY = 'darake.silentBatchLog.v1';

export function loadSilentBatchLog(): SilentBatchLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SilentBatchLogItem[];
  } catch {
    return [];
  }
}

export function saveSilentBatchLog(items: SilentBatchLogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function appendSilentBatchLogItem(item: SilentBatchLogItem): void {
  const items = loadSilentBatchLog();
  saveSilentBatchLog([item, ...items]);
}
