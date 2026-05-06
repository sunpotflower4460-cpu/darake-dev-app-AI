import { loadScreenshotCaptureManifestRecord, summarizeScreenshotCaptureManifestRecord } from './screenshotCaptureManifestRecord';
import { buildUiCheckReadinessGate } from './uiCheckReadinessGate';
import { buildUiMachineCheckInputPack } from './uiMachineCheckInputPack';

export type UiCheckResultBridgeStatus = 'blocked' | 'ready-to-copy' | 'needs-review';

export type UiCheckResultBridge = {
  title: string;
  status: UiCheckResultBridgeStatus;
  message: string;
  suggestedUiCheckResult: {
    status: 'success' | 'warn' | 'failed' | 'unchecked';
    notes: string;
    checkedItems: string[];
    remainingItems: string[];
  };
  blockers: string[];
  warnings: string[];
  nextActions: string[];
};

export function buildUiCheckResultBridge(): UiCheckResultBridge {
  const gate = buildUiCheckReadinessGate();
  const inputPack = buildUiMachineCheckInputPack();
  const manifestRecord = loadScreenshotCaptureManifestRecord();
  const manifestSummary = summarizeScreenshotCaptureManifestRecord(manifestRecord);

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (gate.status === 'blocked') {
    blockers.push('UI Check Readiness Gateがblockedです。blockerを解消してください。');
  }
  if (inputPack.status === 'blocked') {
    blockers.push('UI Machine Check Input Packがblockedです。');
  }
  if (manifestSummary.status === 'failed') {
    blockers.push('manifest確認記録がfailedです。再確認してください。');
  }
  if (manifestSummary.status === 'unchecked') {
    blockers.push('manifest確認記録がuncheckedです。Phase 10.25で確認結果を入力してください。');
  }

  if (gate.status === 'needs-review') {
    warnings.push('UI Check Readiness Gateにwarningがあります。内容を確認してください。');
  }
  if (inputPack.status === 'needs-review') {
    warnings.push('UI Machine Check Input Packにwarningがあります。確認してから転記してください。');
  }
  if (manifestRecord.visualQuickLookResult === 'warn') {
    warnings.push('目視ざっくり確認がwarnです。UI Check Result Recordのnotesに記録してください。');
  }
  if (manifestRecord.privateInfoResult === 'warn') {
    warnings.push('private情報確認がwarnです。転記前にprivate情報の扱いを確認してください。');
  }

  let status: UiCheckResultBridgeStatus;

  if (blockers.length > 0) {
    status = 'blocked';
  } else if (warnings.length > 0) {
    status = 'needs-review';
  } else {
    status = 'ready-to-copy';
  }

  const suggestedStatus: 'success' | 'warn' | 'failed' | 'unchecked' =
    manifestSummary.status === 'success' && gate.status === 'ready'
      ? 'success'
      : manifestSummary.status === 'warn' || gate.status === 'needs-review'
        ? 'warn'
        : manifestSummary.status === 'failed'
          ? 'failed'
          : 'unchecked';

  const checkedItems = inputPack.status !== 'blocked'
    ? inputPack.checkItems
    : [];
  const remainingItems = inputPack.status === 'blocked'
    ? inputPack.checkItems
    : [];

  const suggestedNotes = [
    manifestRecord.notes,
    manifestSummary.status === 'warn' ? 'manifest確認記録にwarnがあります。' : '',
    manifestRecord.visualQuickLookResult === 'warn' ? '目視確認でwarnがありました。' : '',
    manifestRecord.privateInfoResult === 'warn' ? 'private情報確認でwarnがありました。' : '',
  ].filter(Boolean).join(' / ') || 'なし';

  const message =
    status === 'ready-to-copy'
      ? 'UI Check Result Recordへの転記候補が揃っています。下記の候補を参考に記録してください。'
      : status === 'needs-review'
        ? 'warningがあります。内容を確認してからUI Check Result Recordへ転記してください。'
        : 'blockerがあります。UI Check Readiness Gate / manifest記録を確認してください。';

  return {
    title: 'UI Check Result Bridge',
    status,
    message,
    suggestedUiCheckResult: {
      status: suggestedStatus,
      notes: suggestedNotes,
      checkedItems,
      remainingItems,
    },
    blockers,
    warnings,
    nextActions: status === 'ready-to-copy'
      ? [
          'UI Check Result Recordパネルを開き、下記の転記候補を参考に結果を入力してください。',
          `status候補: ${suggestedStatus}`,
          `notes候補: ${suggestedNotes}`,
          'checkedItemsをUI Check Result Recordのpassとして記録してください。',
        ]
      : status === 'needs-review'
        ? [
            'warningの内容を確認してからUI Check Result Recordへ転記してください。',
            'visualQuickLookResult / privateInfoResult の詳細をnotesへ記録してください。',
          ]
        : [
            'UI Check Readiness GateのblockerとUI Machine Check Input PackのblockerをまずPhase 10.27/10.28で解消してください。',
            'manifest確認記録が完成しているか確認してください。',
          ],
  };
}

export function formatUiCheckResultBridge(bridge: UiCheckResultBridge): string {
  const lines: string[] = [
    `# ${bridge.title}`,
    '',
    bridge.message,
    '',
    `- status: ${bridge.status}`,
    '',
    '## 転記候補 (UI Check Result Record へ)',
    `- status: ${bridge.suggestedUiCheckResult.status}`,
    `- notes: ${bridge.suggestedUiCheckResult.notes}`,
  ];

  if (bridge.suggestedUiCheckResult.checkedItems.length > 0) {
    lines.push('', '### checkedItems (pass候補)');
    bridge.suggestedUiCheckResult.checkedItems.forEach((item) => lines.push(`- [x] ${item}`));
  }

  if (bridge.suggestedUiCheckResult.remainingItems.length > 0) {
    lines.push('', '### remainingItems (未確認)');
    bridge.suggestedUiCheckResult.remainingItems.forEach((item) => lines.push(`- [ ] ${item}`));
  }

  if (bridge.blockers.length > 0) {
    lines.push('', '## Blockers');
    bridge.blockers.forEach((b) => lines.push(`- ${b}`));
  }

  if (bridge.warnings.length > 0) {
    lines.push('', '## Warnings');
    bridge.warnings.forEach((w) => lines.push(`- ${w}`));
  }

  lines.push('', '## 次にやること');
  bridge.nextActions.forEach((a) => lines.push(`- ${a}`));

  lines.push(
    '',
    '## Safety Notes',
    '- UI Check Result Recordへの自動保存はしません。',
    '- AIレビュー結果の自動取り込みはしません。',
    '- 転記はすべて手動で行います。',
  );

  return lines.join('\n');
}
