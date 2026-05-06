import { AiReviewTarget } from './aiReviewInputPack';

export type AiReviewResultStatus = 'unchecked' | 'passed' | 'warn' | 'failed';

export type AiReviewResultRecord = {
  id: string;
  target: AiReviewTarget;
  status: AiReviewResultStatus;
  reviewer: 'manual-ai' | 'external-ai' | 'human';
  summary: string;
  findings: string[];
  blockers: string[];
  suggestions: string[];
  createdAt: string;
};

const STORAGE_KEY = 'darake.aiReviewResultRecords.v1';

export function buildInitialAiReviewResultRecord(): AiReviewResultRecord {
  return {
    id: `ai-review-${Date.now()}`,
    target: 'screenshot-ui',
    status: 'unchecked',
    reviewer: 'manual-ai',
    summary: '',
    findings: [],
    blockers: [],
    suggestions: [],
    createdAt: new Date().toISOString(),
  };
}

export function loadAiReviewResultRecords(): AiReviewResultRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AiReviewResultRecord[];
  } catch {
    return [];
  }
}

export function saveAiReviewResultRecords(records: AiReviewResultRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function addAiReviewResultRecord(
  records: AiReviewResultRecord[],
  record: AiReviewResultRecord,
): AiReviewResultRecord[] {
  return [...records, record];
}

export function updateAiReviewResultRecord(
  records: AiReviewResultRecord[],
  updated: AiReviewResultRecord,
): AiReviewResultRecord[] {
  return records.map((r) => (r.id === updated.id ? updated : r));
}

export function deleteAiReviewResultRecord(
  records: AiReviewResultRecord[],
  id: string,
): AiReviewResultRecord[] {
  return records.filter((r) => r.id !== id);
}

export function formatAiReviewResultRecordMarkdown(record: AiReviewResultRecord): string {
  return [
    `# AIレビュー結果: ${record.target}`,
    `- status: ${record.status}`,
    `- reviewer: ${record.reviewer}`,
    `- createdAt: ${record.createdAt}`,
    '',
    '## サマリー',
    record.summary || '（未入力）',
    '',
    '## Findings',
    record.findings.length > 0 ? record.findings.map((f) => `- ${f}`).join('\n') : '- なし',
    '',
    '## Blockers',
    record.blockers.length > 0 ? record.blockers.map((b) => `- 🔴 ${b}`).join('\n') : '- なし',
    '',
    '## Suggestions',
    record.suggestions.length > 0 ? record.suggestions.map((s) => `- 💡 ${s}`).join('\n') : '- なし',
  ].join('\n');
}

export function getStatusLabel(status: AiReviewResultStatus): string {
  const labels: Record<AiReviewResultStatus, string> = {
    unchecked: '⬜ 未確認',
    passed: '✅ 通過',
    warn: '⚠️ 警告',
    failed: '❌ 失敗',
  };
  return labels[status];
}
