export type ScreenshotWorkflowManualRunStep = {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
};

export type ScreenshotWorkflowManualRunGuide = {
  title: string;
  status: 'manual-only';
  workflowPath: string;
  workflowName: string;
  actionsPageHint: string;
  steps: ScreenshotWorkflowManualRunStep[];
  requiredInputs: Array<{
    name: string;
    value: string;
    source: string;
  }>;
  stopIf: string[];
  afterRunChecks: string[];
  safetyNotes: string[];
};

export function buildScreenshotWorkflowManualRunGuide(): ScreenshotWorkflowManualRunGuide {
  return {
    title: 'Workflow Manual Run Guide',
    status: 'manual-only',
    workflowPath: '.github/workflows/screenshot-capture-draft.yml',
    workflowName: 'Screenshot Capture Draft',
    actionsPageHint: 'GitHub → darake-dev-app-AI → Actions → Screenshot Capture Draft',
    steps: [
      {
        id: 'open-actions',
        title: 'Actionsを開く',
        detail: 'GitHubのリポジトリ画面でActionsタブを開きます。',
        actionLabel: 'GitHub Actionsへ移動',
      },
      {
        id: 'select-workflow',
        title: 'Screenshot Capture Draftを選ぶ',
        detail: '左側のworkflow一覧からScreenshot Capture Draftを選びます。',
        actionLabel: 'workflowを選択',
      },
      {
        id: 'run-workflow',
        title: 'Run workflowを開く',
        detail: '右上または画面内のRun workflowボタンを押して入力欄を開きます。',
        actionLabel: '入力欄を開く',
      },
      {
        id: 'paste-plan-json',
        title: 'plan_jsonを貼る',
        detail: 'Phase 10.9のScreenshot Plan ExportからコピーしたJSONをplan_jsonへ貼ります。',
        actionLabel: 'JSONを貼り付け',
      },
      {
        id: 'keep-dry-run',
        title: 'dry_run=trueを維持する',
        detail: 'dry_runは必ずtrueのままにします。falseにするとworkflow側で拒否されます。',
        actionLabel: 'dry_runを確認',
      },
      {
        id: 'keep-manual-gate',
        title: 'require_manual_gate=trueを維持する',
        detail: 'require_manual_gateもtrueのままにします。falseにするとworkflow側で拒否されます。',
        actionLabel: 'manual gateを確認',
      },
      {
        id: 'submit-dry-run',
        title: 'dry-runとして実行する',
        detail: '内容を確認してからRun workflowを押します。このworkflowはplanを検証・表示・artifact保存するだけです。',
        actionLabel: 'dry-run実行',
      },
      {
        id: 'check-artifact',
        title: 'Artifactを確認する',
        detail: '完了後、screenshot-plan-dry-run artifactが作られているか確認します。',
        actionLabel: 'artifact確認',
      },
    ],
    requiredInputs: [
      {
        name: 'plan_json',
        value: 'Phase 10.9でコピーしたJSON',
        source: 'Screenshot Plan Export Panel',
      },
      {
        name: 'dry_run',
        value: 'true',
        source: '固定。falseは禁止。',
      },
      {
        name: 'require_manual_gate',
        value: 'true',
        source: '固定。falseは禁止。',
      },
    ],
    stopIf: [
      'Preview URLが未入力',
      'Screenshot Plan Exportのstatusがnot-ready',
      'Run Gateがblocked',
      'plan_jsonにsecret / token / key / cookie / passwordを含めようとしている',
      'dry_run=falseに変更したくなった',
      'require_manual_gate=falseに変更したくなった',
      '本番公開やdeployに関わる入力が出てきた',
    ],
    afterRunChecks: [
      'workflow runがsuccessになったか',
      'screenshot-plan-dry-run artifactが作られたか',
      'plan JSONのschemaVersionが正しく表示されたか',
      'runner.modeがdraft-onlyのままか',
      'runner.shouldRunAutomaticallyがfalseのままか',
    ],
    safetyNotes: [
      'This guide is manual-only.',
      'The app does not dispatch GitHub Actions.',
      'The dry-run workflow performs no screenshot capture.',
      'The dry-run workflow launches no browser and calls no external worker.',
      'Real capture must remain behind a later manual gate.',
    ],
  };
}

export function formatScreenshotWorkflowManualRunGuide(guide: ScreenshotWorkflowManualRunGuide): string {
  return [
    `# ${guide.title}`,
    '',
    `- status: ${guide.status}`,
    `- workflowPath: ${guide.workflowPath}`,
    `- workflowName: ${guide.workflowName}`,
    `- actionsPageHint: ${guide.actionsPageHint}`,
    '',
    '## Steps',
    ...guide.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.detail}`),
    '',
    '## Required Inputs',
    ...guide.requiredInputs.map((input) => `- ${input.name}: ${input.value} / ${input.source}`),
    '',
    '## Stop If',
    ...guide.stopIf.map((item) => `- ${item}`),
    '',
    '## After Run Checks',
    ...guide.afterRunChecks.map((item) => `- ${item}`),
    '',
    '## Safety Notes',
    ...guide.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
