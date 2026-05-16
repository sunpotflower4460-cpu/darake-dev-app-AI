export type AppCreationStep =
  | 'idea'
  | 'mvp'
  | 'blueprint'
  | 'phase-breakdown'
  | 'issue-created'
  | 'agent-handed'
  | 'pr-review'
  | 'preview-check'
  | 'next-improvement';

export type AppCreationRecord = {
  appName: string;
  oneLineIdea: string;
  currentStep: AppCreationStep;
  completedSteps: AppCreationStep[];
  updatedAt: string;
};

export type FlowStepMeta = {
  id: AppCreationStep;
  num: number;
  label: string;
  description: string;
  humanAction: boolean;
};

export const FLOW_STEPS: FlowStepMeta[] = [
  { id: 'idea', num: 1, label: '作りたいものを置く', description: 'アプリ名と一行アイデアを入れる', humanAction: true },
  { id: 'mvp', num: 2, label: 'AIがMVPを決める', description: '最小完成形を自動で整理する', humanAction: false },
  { id: 'blueprint', num: 3, label: '設計図を作る', description: '目的・やること・やらないことを整理する', humanAction: false },
  { id: 'phase-breakdown', num: 4, label: 'Phase分解する', description: '作業を小さなPhaseに分ける', humanAction: false },
  { id: 'issue-created', num: 5, label: 'GitHub Issueを作る', description: '作業IssueをGitHubに登録する', humanAction: false },
  { id: 'agent-handed', num: 6, label: 'Agentに渡す', description: 'Cloud Agent / Codex に指示を渡す', humanAction: false },
  { id: 'pr-review', num: 7, label: 'PRを確認する', description: 'CIとレビューの状態を確認する', humanAction: true },
  { id: 'preview-check', num: 8, label: 'Previewを見る', description: '実際の画面をチェックする', humanAction: true },
  { id: 'next-improvement', num: 9, label: '次の改善を提案する', description: '次のPhaseを計画する', humanAction: false },
];

const STORAGE_KEY = 'darake.appCreationFlow.v1';

export function loadAppCreationRecord(): AppCreationRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppCreationRecord;
  } catch {
    return null;
  }
}

export function saveAppCreationRecord(record: AppCreationRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
}

export function clearAppCreationRecord(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function advanceAppCreationFlow(record: AppCreationRecord): AppCreationRecord {
  const steps = FLOW_STEPS.map((s) => s.id);
  const currentIndex = steps.indexOf(record.currentStep);
  const nextIndex = currentIndex + 1;
  if (nextIndex >= steps.length) return record;

  const nextStep = steps[nextIndex]!;
  return {
    ...record,
    currentStep: nextStep,
    completedSteps: [...new Set([...record.completedSteps, record.currentStep])],
    updatedAt: new Date().toISOString(),
  };
}
