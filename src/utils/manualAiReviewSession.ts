export type ManualAiReviewSessionStatus =
  | 'draft'
  | 'prompt-copied'
  | 'waiting-result'
  | 'result-pasted'
  | 'triaged'
  | 'issue-drafted'
  | 'done';

export type ManualAiReviewSession = {
  id: string;
  provider: string;
  taskType: string;
  title: string;
  prompt: string;
  expectedOutputFormat: string;
  resultText: string;
  status: ManualAiReviewSessionStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;
};

const STORAGE_KEY = 'darake.manualAiReviewSessions.v1';

export function loadManualAiReviewSessions(): ManualAiReviewSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ManualAiReviewSession[];
  } catch {
    return [];
  }
}

export function saveManualAiReviewSessions(sessions: ManualAiReviewSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function buildManualAiReviewSession(
  partial: Partial<ManualAiReviewSession> & Pick<ManualAiReviewSession, 'title' | 'prompt'>
): ManualAiReviewSession {
  const now = new Date().toISOString();
  return {
    id: `ai-session-${crypto.randomUUID()}`,
    provider: 'ChatGPT / Claude / Gemini',
    taskType: 'code-review',
    expectedOutputFormat: 'Markdown リスト',
    resultText: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    notes: '',
    ...partial,
  };
}

export function updateManualAiReviewSession(
  sessions: ManualAiReviewSession[],
  id: string,
  updates: Partial<ManualAiReviewSession>
): ManualAiReviewSession[] {
  return sessions.map((s) =>
    s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
  );
}

export function formatManualAiReviewSessionMarkdown(session: ManualAiReviewSession): string {
  const lines: string[] = [
    `## AI Review Session: ${session.title}`,
    `- **provider**: ${session.provider}`,
    `- **taskType**: ${session.taskType}`,
    `- **status**: ${session.status}`,
    `- **createdAt**: ${session.createdAt}`,
    '',
    `### Prompt`,
    '```',
    session.prompt || '(未入力)',
    '```',
    '',
    `### Expected Output Format`,
    session.expectedOutputFormat || '(未入力)',
    '',
    `### Result`,
    session.resultText || '(未入力)',
    '',
    `### Notes`,
    session.notes || '(なし)',
    '',
    `> ⛔ AI API は呼びません。プロンプトをコピーして人間がAIに貼り付けてください。`,
  ];
  return lines.join('\n');
}
