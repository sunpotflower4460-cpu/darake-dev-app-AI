export type WorkflowDispatchCandidateDraft = {
  workflowName: string;
  workflowPath: string;
  status: 'draft-only' | 'manual-gate' | 'blocked';
  inputs: Array<{
    name: string;
    value: string;
    safeToCopy: boolean;
  }>;
  manualSteps: string[];
  blockedReasons: string[];
};

const DEFAULT_WORKFLOWS: WorkflowDispatchCandidateDraft[] = [
  {
    workflowName: 'playwright-setup-dry-run',
    workflowPath: '.github/workflows/playwright-setup-dry-run.yml',
    status: 'manual-gate',
    inputs: [
      { name: 'dry_run', value: 'true', safeToCopy: true },
    ],
    manualSteps: [
      '1. GitHub → Actions タブを開く',
      '2. playwright-setup-dry-run ワークフローを選択',
      '3. "Run workflow" をクリック',
      '4. dry_run: true を確認して実行',
    ],
    blockedReasons: ['自動dispatchなし：手動実行のみ'],
  },
  {
    workflowName: 'screenshot-capture-limited-manual',
    workflowPath: '.github/workflows/screenshot-capture.yml',
    status: 'manual-gate',
    inputs: [
      { name: 'mode', value: 'limited', safeToCopy: true },
      { name: 'dry_run', value: 'true', safeToCopy: true },
    ],
    manualSteps: [
      '1. GitHub → Actions タブを開く',
      '2. screenshot-capture ワークフローを選択',
      '3. "Run workflow" をクリック',
      '4. mode: limited, dry_run: true を確認して実行',
    ],
    blockedReasons: ['自動dispatchなし：手動実行のみ'],
  },
  {
    workflowName: 'future-screenshot-ui-check',
    workflowPath: '.github/workflows/screenshot-ui-check.yml（未作成）',
    status: 'draft-only',
    inputs: [
      { name: 'target', value: 'all-screens', safeToCopy: true },
    ],
    manualSteps: [
      '1. ワークフローファイルを作成する',
      '2. GitHub → Actions タブで確認',
      '3. 手動実行',
    ],
    blockedReasons: ['ワークフローファイル未作成', '自動dispatchなし'],
  },
  {
    workflowName: 'future-build-test',
    workflowPath: '.github/workflows/build-test.yml（未作成）',
    status: 'draft-only',
    inputs: [
      { name: 'run_tests', value: 'true', safeToCopy: true },
    ],
    manualSteps: [
      '1. ワークフローファイルを作成する',
      '2. PR作成時に自動実行される設定を追加',
      '3. 必要に応じて手動実行',
    ],
    blockedReasons: ['ワークフローファイル未作成', '自動dispatchなし'],
  },
];

const STORAGE_KEY = 'darake.workflowDispatchCandidates.v1';

export function loadWorkflowDispatchCandidates(): WorkflowDispatchCandidateDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKFLOWS;
    return JSON.parse(raw) as WorkflowDispatchCandidateDraft[];
  } catch {
    return DEFAULT_WORKFLOWS;
  }
}

export function saveWorkflowDispatchCandidates(candidates: WorkflowDispatchCandidateDraft[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  } catch {
    // ignore
  }
}

export function formatWorkflowDispatchCandidateMarkdown(draft: WorkflowDispatchCandidateDraft): string {
  return [
    `# Workflow Dispatch候補: ${draft.workflowName}`,
    `- path: ${draft.workflowPath}`,
    `- status: ${draft.status}`,
    '',
    '## Inputs',
    ...draft.inputs.map((i) => `- ${i.name}: ${i.value} (コピー可: ${i.safeToCopy ? 'はい' : 'いいえ'})`),
    '',
    '## 手動実行手順',
    ...draft.manualSteps.map((s) => `- ${s}`),
    '',
    '## ブロック理由',
    ...draft.blockedReasons.map((r) => `- ${r}`),
  ].join('\n');
}
