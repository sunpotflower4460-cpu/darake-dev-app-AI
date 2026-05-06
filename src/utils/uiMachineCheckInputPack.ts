import { loadScreenshotCaptureManifestRecord, summarizeScreenshotCaptureManifestRecord } from './screenshotCaptureManifestRecord';
import { buildUiCheckReadinessGate } from './uiCheckReadinessGate';

export type UiMachineCheckInputPackStatus = 'blocked' | 'ready' | 'needs-review';

export type UiMachineCheckInputPack = {
  title: string;
  status: UiMachineCheckInputPackStatus;
  message: string;
  source: {
    artifactUrl: string;
    workflowRunUrl: string;
    capturedCount: string;
    failedCount: string;
    notes: string;
  };
  checkItems: string[];
  machineRules: string[];
  hardStops: string[];
  markdown: string;
};

const DEFAULT_CHECK_ITEMS = [
  '真っ白画面ではない',
  'ローディングで止まっていない',
  '横スクロールが出ていない',
  '主要ボタンが見えている',
  '文字が極端に小さくない',
  'エラー文が画面に出ていない',
  'スマホ幅で破綻していない',
  'private情報が写っていない',
];

const MACHINE_RULES = [
  '全チェック項目を目視で1つずつ確認する',
  'failedCountが0であることを確認する',
  'capturedCountがexpectedと一致するか確認する',
  '確認結果をUI Check Result Recordに記録する',
  'warnがある場合は理由をnotesに記録する',
];

export function buildUiMachineCheckInputPack(): UiMachineCheckInputPack {
  const gate = buildUiCheckReadinessGate();
  const manifestRecord = loadScreenshotCaptureManifestRecord();
  const manifestSummary = summarizeScreenshotCaptureManifestRecord(manifestRecord);

  const hardStops: string[] = [];

  if (gate.status === 'blocked') {
    hardStops.push('UI Check Readiness Gateがblockedです。blockerを解消してください。');
  }
  if (manifestSummary.status === 'failed') {
    hardStops.push('manifest確認記録がfailedです。');
  }
  if (!manifestRecord.capturedCount || Number.parseInt(manifestRecord.capturedCount, 10) === 0) {
    hardStops.push('capturedCountが0または未入力です。');
  }
  const failedNum = Number.parseInt(manifestRecord.failedCount || '0', 10);
  if (Number.isFinite(failedNum) && failedNum > 0) {
    hardStops.push(`failedCountが${manifestRecord.failedCount}です。0になるまで進みません。`);
  }

  let status: UiMachineCheckInputPackStatus;

  if (hardStops.length > 0 || gate.status === 'blocked') {
    status = 'blocked';
  } else if (gate.status === 'needs-review') {
    status = 'needs-review';
  } else {
    status = 'ready';
  }

  const message =
    status === 'ready'
      ? 'UI Check Input Packが準備できました。下記チェック項目を目視で確認してください。'
      : status === 'needs-review'
        ? '一部に確認が必要な項目があります。確認してからチェックを進めてください。'
        : 'blockerがあります。UI Check Readiness Gateを確認してください。';

  const markdown = buildMarkdown({
    status,
    message,
    artifactUrl: manifestRecord.artifactUrl,
    workflowRunUrl: manifestRecord.workflowRunUrl,
    capturedCount: manifestRecord.capturedCount,
    failedCount: manifestRecord.failedCount,
    notes: manifestRecord.notes,
    checkItems: DEFAULT_CHECK_ITEMS,
    machineRules: MACHINE_RULES,
    hardStops,
  });

  return {
    title: 'UI Machine Check Input Pack',
    status,
    message,
    source: {
      artifactUrl: manifestRecord.artifactUrl,
      workflowRunUrl: manifestRecord.workflowRunUrl,
      capturedCount: manifestRecord.capturedCount,
      failedCount: manifestRecord.failedCount,
      notes: manifestRecord.notes,
    },
    checkItems: DEFAULT_CHECK_ITEMS,
    machineRules: MACHINE_RULES,
    hardStops,
    markdown,
  };
}

function buildMarkdown(params: {
  status: UiMachineCheckInputPackStatus;
  message: string;
  artifactUrl: string;
  workflowRunUrl: string;
  capturedCount: string;
  failedCount: string;
  notes: string;
  checkItems: string[];
  machineRules: string[];
  hardStops: string[];
}): string {
  const lines: string[] = [
    '# UI Machine Check Input Pack',
    '',
    params.message,
    '',
    `- status: ${params.status}`,
    '',
    '## Source',
    `- artifactUrl: ${params.artifactUrl || '未入力'}`,
    `- workflowRunUrl: ${params.workflowRunUrl || '未入力'}`,
    `- capturedCount: ${params.capturedCount || '未入力'}`,
    `- failedCount: ${params.failedCount || '未入力'}`,
    `- notes: ${params.notes || 'なし'}`,
    '',
    '## UIチェック項目',
    ...params.checkItems.map((item) => `- [ ] ${item}`),
    '',
    '## Machine Rules',
    ...params.machineRules.map((rule) => `- ${rule}`),
  ];

  if (params.hardStops.length > 0) {
    lines.push('', '## Hard Stops');
    params.hardStops.forEach((stop) => lines.push(`- ${stop}`));
  }

  lines.push(
    '',
    '## Safety Notes',
    '- 実際の画像解析・AIレビューはしません。',
    '- GitHub Actions dispatchはしません。',
    '- artifact取得は手動で行います。',
  );

  return lines.join('\n');
}
