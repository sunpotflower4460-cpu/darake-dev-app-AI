export type LimitedScreenshotCaptureManualRunStep = {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
};

export type LimitedScreenshotCaptureManualRunGuide = {
  title: string;
  status: 'manual-only';
  workflowPath: string;
  workflowName: string;
  actionsPageHint: string;
  steps: LimitedScreenshotCaptureManualRunStep[];
  requiredInputs: Array<{
    name: string;
    value: string;
    source: string;
  }>;
  stopIf: string[];
  beforeRunChecks: string[];
  afterRunChecks: string[];
  artifactChecks: Array<{
    label: string;
    expected: string;
  }>;
  safetyNotes: string[];
};

export function buildLimitedScreenshotCaptureManualRunGuide(): LimitedScreenshotCaptureManualRunGuide {
  return {
    title: 'Limited Screenshot Capture Manual Run Guide',
    status: 'manual-only',
    workflowPath: '.github/workflows/screenshot-capture-limited-manual.yml',
    workflowName: 'Screenshot Capture Limited Manual',
    actionsPageHint: 'GitHub → darake-dev-app-AI → Actions → Screenshot Capture Limited Manual',
    steps: [
      {
        id: 'open-app-plan-export',
        title: 'アプリ内でScreenshot Plan Exportを確認する',
        detail: 'Preview URLと撮影対象が正しいことを確認し、Screenshot Plan ExportのJSONをコピーします。',
        actionLabel: 'plan_jsonをコピー',
      },
      {
        id: 'open-actions',
        title: 'GitHub Actionsを開く',
        detail: 'GitHubのリポジトリ画面でActionsタブを開きます。',
        actionLabel: 'Actionsへ移動',
      },
      {
        id: 'select-workflow',
        title: 'Screenshot Capture Limited Manualを選ぶ',
        detail: '左側のworkflow一覧からScreenshot Capture Limited Manualを選びます。',
        actionLabel: 'workflowを選択',
      },
      {
        id: 'run-workflow',
        title: 'Run workflowを開く',
        detail: 'Run workflowボタンを押して入力欄を開きます。',
        actionLabel: '入力欄を開く',
      },
      {
        id: 'paste-plan-json',
        title: 'plan_jsonを貼る',
        detail: 'アプリでコピーしたScreenshot Plan Export JSONをplan_jsonへ貼ります。private情報が混ざっていないか再確認します。',
        actionLabel: 'plan_jsonを貼る',
      },
      {
        id: 'input-confirm-capture',
        title: 'confirm_captureを入力する',
        detail: 'confirm_captureにCAPTURE_LIMITED_APPROVEDを入力します。1文字でも違うとworkflow側で停止します。',
        actionLabel: 'confirm_captureを入力',
      },
      {
        id: 'choose-max-targets',
        title: 'max_targets=1を選ぶ',
        detail: '初回は必ず1を選びます。2は初回成功後にだけ使う想定です。',
        actionLabel: 'max_targetsを確認',
      },
      {
        id: 'submit-run',
        title: '手動で実行する',
        detail: '入力内容を確認し、Run workflowを押します。アプリからの自動実行ではありません。',
        actionLabel: 'workflowを実行',
      },
      {
        id: 'check-run-result',
        title: 'workflow結果を確認する',
        detail: 'runがsuccessかfailedかを確認します。failedの場合はmanifestやログを見ます。',
        actionLabel: 'run結果確認',
      },
      {
        id: 'download-artifact',
        title: 'artifactを確認する',
        detail: 'screenshot-capture-limited artifactにPNGとscreenshot-capture-manifest.jsonが含まれているか確認します。',
        actionLabel: 'artifact確認',
      },
    ],
    requiredInputs: [
      {
        name: 'plan_json',
        value: 'Screenshot Plan Export JSON',
        source: 'アプリ内のScreenshot Plan Exportパネルからコピーします。',
      },
      {
        name: 'confirm_capture',
        value: 'CAPTURE_LIMITED_APPROVED',
        source: '固定。違う値は禁止。',
      },
      {
        name: 'max_targets',
        value: '1',
        source: '初回は1固定推奨。2は成功後のみ。',
      },
    ],
    stopIf: [
      'Screenshot Capture Limited Manual workflowが見つからない',
      'Screenshot Plan Export JSONをコピーできない',
      'Preview URLが空、または意図しないURLになっている',
      'plan_jsonにprivate credential-like textが含まれている',
      'confirm_captureを正確に入力できない',
      'max_targetsが2より大きい値を求められる',
      'deploy / publish / database write / App Storeに関係する入力が出てきた',
      '共有したくない画面が撮影対象に入っている',
    ],
    beforeRunChecks: [
      'Preview URLが公開してよい画面か',
      '撮影対象が1〜2件だけか',
      '初回max_targetsが1か',
      'plan_jsonに認証情報やprivate情報がないか',
      'Capture GateとPlaywright setup reportが許可状態か',
      'artifactにスクショ画像が残る前提を理解しているか',
    ],
    afterRunChecks: [
      'workflow runがsuccessになったか',
      'screenshot-capture-limited artifactが生成されたか',
      'PNG画像が含まれるか',
      'artifacts/screenshot-capture-manifest.jsonが含まれるか',
      'manifest schemaVersionがdarake-screenshot-capture-manifest-v1か',
      'capturedCountが1以上か',
      'failedCountが0か',
      'スクショにprivate情報が写っていないか',
    ],
    artifactChecks: [
      {
        label: 'artifact name',
        expected: 'screenshot-capture-limited',
      },
      {
        label: 'screenshots path',
        expected: 'artifacts/screenshots/**',
      },
      {
        label: 'manifest file',
        expected: 'artifacts/screenshot-capture-manifest.json',
      },
      {
        label: 'manifest schemaVersion',
        expected: 'darake-screenshot-capture-manifest-v1',
      },
      {
        label: 'max_targets first run',
        expected: '1',
      },
    ],
    safetyNotes: [
      'This guide is manual-only.',
      'The app does not dispatch GitHub Actions.',
      'The workflow can open the approved Preview URL targets from plan_json.',
      'Artifacts may contain screenshots and should be inspected before sharing.',
      'Use max_targets=1 for the first real capture.',
    ],
  };
}

export function formatLimitedScreenshotCaptureManualRunGuide(guide: LimitedScreenshotCaptureManualRunGuide): string {
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
    '## Before Run Checks',
    ...guide.beforeRunChecks.map((item) => `- ${item}`),
    '',
    '## After Run Checks',
    ...guide.afterRunChecks.map((item) => `- ${item}`),
    '',
    '## Artifact Checks',
    ...guide.artifactChecks.map((item) => `- ${item.label}: ${item.expected}`),
    '',
    '## Safety Notes',
    ...guide.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
