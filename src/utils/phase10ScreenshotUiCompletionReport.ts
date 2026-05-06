import { loadDryRunArtifactCheckRecord, summarizeDryRunArtifactCheckRecord } from './dryRunArtifactCheckRecord';
import { loadPlaywrightSetupReportRecord, summarizePlaywrightSetupReportRecord } from './playwrightSetupReportRecord';
import { loadPreviewUrlRecord } from './previewUrlStore';
import { loadScreenshotCaptureManifestRecord, summarizeScreenshotCaptureManifestRecord } from './screenshotCaptureManifestRecord';
import { buildScreenshotJobDraft } from './screenshotJobDraft';
import { buildScreenshotPlanExport } from './screenshotPlanExport';
import { loadScreenshotResultRecord, summarizeScreenshotResult } from './screenshotResultRecord';
import { buildScreenshotRunGate } from './screenshotRunGate';
import { buildUiCheckReadinessGate } from './uiCheckReadinessGate';
import { buildUiMachineCheckInputPack } from './uiMachineCheckInputPack';

export type Phase10ScreenshotUiCompletionReportStatus =
  | 'blocked'
  | 'needs-review'
  | 'ready-for-next-phase';

export type Phase10ScreenshotUiCompletionReport = {
  title: string;
  status: Phase10ScreenshotUiCompletionReportStatus;
  message: string;
  completed: string[];
  remainingManualActions: string[];
  blockers: string[];
  warnings: string[];
  nextRecommendedPhase: string;
  nextActions: string[];
};

export function buildPhase10ScreenshotUiCompletionReport(): Phase10ScreenshotUiCompletionReport {
  const previewRecord = loadPreviewUrlRecord();
  const screenshotDraft = buildScreenshotJobDraft(previewRecord);
  const plan = buildScreenshotPlanExport(screenshotDraft);
  const runGate = buildScreenshotRunGate(plan);
  const artifactRecord = loadDryRunArtifactCheckRecord();
  const artifactSummary = summarizeDryRunArtifactCheckRecord(artifactRecord);
  const playwrightRecord = loadPlaywrightSetupReportRecord();
  const playwrightSummary = summarizePlaywrightSetupReportRecord(playwrightRecord);
  const manifestRecord = loadScreenshotCaptureManifestRecord();
  const manifestSummary = summarizeScreenshotCaptureManifestRecord(manifestRecord);
  const resultFallback = { title: 'Screenshot Result Record', sourceStatus: screenshotDraft.status as 'not-ready', entries: [] };
  const resultRecord = loadScreenshotResultRecord(resultFallback);
  const resultSummary = summarizeScreenshotResult(resultRecord);
  const uiReadinessGate = buildUiCheckReadinessGate();
  const inputPack = buildUiMachineCheckInputPack();

  const hasPreviewUrl = Boolean(previewRecord.previewUrl.trim());
  const hasPlan = plan.targets.length > 0;
  const playwrightOk = playwrightSummary.status === 'success';
  const manifestOk = manifestSummary.status === 'success';
  const resultHasEntries = resultRecord.entries.length > 0 || Boolean(manifestRecord.workflowRunUrl);

  const completed: string[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const remainingManualActions: string[] = [];

  // Preview URL
  if (hasPreviewUrl) {
    completed.push('Preview URLが記録されています');
  } else {
    blockers.push('Preview URLが未入力です（Phase 10.1）');
    remainingManualActions.push('Phase 10.1: Preview URLを入力してください');
  }

  // Screenshot Plan
  if (hasPlan) {
    completed.push(`Screenshot Planがあります（${plan.targets.length}件のターゲット）`);
  } else {
    blockers.push('Screenshot Planのターゲットがありません（Phase 10.2）');
    remainingManualActions.push('Phase 10.2: Screenshot Planのターゲットを設定してください');
  }

  // Run Gate
  if (runGate.status === 'ready') {
    completed.push('Screenshot Run Gateはready');
  } else if (runGate.status === 'needs-review') {
    warnings.push('Screenshot Run Gateにwarningがあります');
  } else {
    blockers.push('Screenshot Run Gateがblockedです');
  }

  // Dry Run Artifact
  if (artifactSummary.canProceedToCapturePlanning) {
    completed.push('Dry-run Artifact確認が完了しています');
  } else if (artifactSummary.status === 'failed') {
    blockers.push('Dry-run Artifact確認がfailedです（Phase 10.15）');
  } else if (artifactSummary.status === 'warn') {
    warnings.push('Dry-run Artifact確認にwarnがあります');
    completed.push('Dry-run Artifact確認（warn）');
  } else {
    remainingManualActions.push('Phase 10.15: Dry-run Artifact確認を完了してください');
  }

  // Playwright Setup
  if (playwrightOk) {
    completed.push('Playwright setup report確認が完了しています');
  } else if (playwrightSummary.status === 'failed') {
    blockers.push('Playwright setup reportがfailedです（Phase 10.20）');
    remainingManualActions.push('Phase 10.20: Playwright setup reportを確認してください');
  } else if (playwrightSummary.status === 'warn') {
    warnings.push('Playwright setup reportにwarnがあります');
    completed.push('Playwright setup report（warn）');
  } else {
    remainingManualActions.push('Phase 10.20: Playwright setup reportを確認してください');
  }

  // Capture Manifest
  if (manifestOk) {
    completed.push('capture manifest記録がsuccessです');
  } else if (manifestSummary.status === 'failed') {
    blockers.push('manifest確認記録がfailedです（Phase 10.25）');
    remainingManualActions.push('Phase 10.25: manifest確認記録を完成させてください');
  } else if (manifestSummary.status === 'warn') {
    warnings.push('manifest確認記録にwarnがあります');
    completed.push('manifest確認記録（warn）');
  } else {
    remainingManualActions.push('Phase 10.25: manifest確認記録を完成させてください');
  }

  // capturedCount / failedCount
  const failedNum = Number.parseInt(manifestRecord.failedCount || '0', 10);
  if (manifestRecord.capturedCount && Number.parseInt(manifestRecord.capturedCount, 10) > 0) {
    completed.push(`capturedCount = ${manifestRecord.capturedCount}`);
  } else {
    remainingManualActions.push('capturedCountを入力してください');
  }
  if (Number.isFinite(failedNum) && failedNum === 0) {
    completed.push('failedCount = 0（OK）');
  } else if (failedNum > 0) {
    blockers.push(`failedCount = ${manifestRecord.failedCount}（UIチェックへ進めません）`);
  }

  // Screenshot Result Record
  if (resultHasEntries) {
    completed.push('Screenshot Result Recordに情報があります');
  } else {
    remainingManualActions.push('Phase 10.26の転記サポートを参考にScreenshot Result Recordを入力してください');
  }

  // UI Check Readiness Gate
  if (uiReadinessGate.status === 'ready') {
    completed.push('UI Check Readiness Gateがreadyです');
  } else if (uiReadinessGate.status === 'needs-review') {
    warnings.push('UI Check Readiness Gateにwarningがあります');
  } else {
    blockers.push('UI Check Readiness Gateがblockedです（Phase 10.27）');
    remainingManualActions.push('Phase 10.27: UI Check Readiness Gateのblockerを解消してください');
  }

  // UI Machine Check Input Pack
  if (inputPack.status === 'ready') {
    completed.push('UI Machine Check Input Packが準備できています');
  } else if (inputPack.status === 'needs-review') {
    warnings.push('UI Machine Check Input Packにwarningがあります');
    completed.push('UI Machine Check Input Pack（needs-review）');
  } else {
    remainingManualActions.push('Phase 10.28: UI Machine Check Input Packのblockerを解消してください');
  }

  // Final status
  let status: Phase10ScreenshotUiCompletionReportStatus;
  if (blockers.length > 0) {
    status = 'blocked';
  } else if (warnings.length > 0) {
    status = 'needs-review';
  } else {
    status = 'ready-for-next-phase';
  }

  const message =
    status === 'ready-for-next-phase'
      ? 'Phase 10のスクショ〜UIチェック準備の流れが揃っています。Phase 11へ進む準備ができています。'
      : status === 'needs-review'
        ? '一部にwarningがあります。内容を確認してからPhase 11へ進んでください。'
        : 'blockerがあります。必須項目を解消してからUIチェックへ進みます。';

  return {
    title: 'Phase 10 Screenshot × UI 完成間近レポート',
    status,
    message,
    completed,
    remainingManualActions,
    blockers,
    warnings,
    nextRecommendedPhase: status === 'ready-for-next-phase'
      ? 'Phase 11: AIによるスクショレビュー・自動解析'
      : status === 'needs-review'
        ? 'warningを確認してからPhase 11の計画へ'
        : 'blockerを解消してからUI Check Result Recordへ転記',
    nextActions: status === 'ready-for-next-phase'
      ? [
          'Phase 10.29のUI Check Result Bridgeでresult recordへ転記してください。',
          'UI Check Result Recordに全項目を記録してください。',
          'Phase 11のAIレビュー計画へ進む準備ができています。',
        ]
      : status === 'needs-review'
        ? [
            'warningの内容を確認してください。',
            'UI Check Result Bridgeで転記候補を確認してください。',
            'ready-for-next-phaseになったらPhase 11へ進んでください。',
          ]
        : [
            '上記blockerを1つずつ解消してください。',
            'Phase 10.25: manifest確認記録を完成させてください。',
            'Phase 10.27: UI Check Readiness Gateを確認してください。',
          ],
  };
}

export function formatPhase10ScreenshotUiCompletionReport(report: Phase10ScreenshotUiCompletionReport): string {
  const lines: string[] = [
    `# ${report.title}`,
    '',
    report.message,
    '',
    `- status: ${report.status}`,
    `- nextRecommendedPhase: ${report.nextRecommendedPhase}`,
  ];

  if (report.completed.length > 0) {
    lines.push('', '## 完了したこと');
    report.completed.forEach((item) => lines.push(`- ✅ ${item}`));
  }

  if (report.remainingManualActions.length > 0) {
    lines.push('', '## 手動確認が必要なこと');
    report.remainingManualActions.forEach((item) => lines.push(`- 📋 ${item}`));
  }

  if (report.blockers.length > 0) {
    lines.push('', '## Blockers');
    report.blockers.forEach((b) => lines.push(`- 🔴 ${b}`));
  }

  if (report.warnings.length > 0) {
    lines.push('', '## Warnings');
    report.warnings.forEach((w) => lines.push(`- ⚠️ ${w}`));
  }

  lines.push('', '## 次のおすすめ');
  report.nextActions.forEach((a) => lines.push(`- ${a}`));

  lines.push(
    '',
    '## Safety Notes',
    '- このレポートはすべて既存記録の読み取りのみです。',
    '- GitHub Actionsを自動実行しません。',
    '- artifact取得・画像解析はしません。',
    '- Phase 11以降でAIレビューへ進みます。',
  );

  return lines.join('\n');
}
