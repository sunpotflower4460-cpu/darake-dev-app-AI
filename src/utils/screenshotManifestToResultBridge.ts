import {
  loadScreenshotCaptureManifestRecord,
  summarizeScreenshotCaptureManifestRecord,
} from './screenshotCaptureManifestRecord';

export type ScreenshotManifestToResultBridgeStatus =
  | 'blocked'
  | 'ready-to-copy'
  | 'needs-review';

export type ScreenshotManifestToResultBridge = {
  title: string;
  status: ScreenshotManifestToResultBridgeStatus;
  message: string;
  source: {
    workflowRunUrl: string;
    artifactUrl: string;
    artifactName: string;
    manifestFileName: string;
    capturedCount: string;
    failedCount: string;
  };
  suggestedResultRecord: {
    resultStatus: 'success' | 'warn' | 'failed' | 'unchecked';
    artifactUrl: string;
    capturedCount: string;
    failedCount: string;
    notes: string;
  };
  blockers: string[];
  warnings: string[];
  nextActions: string[];
};

export function buildScreenshotManifestToResultBridge(): ScreenshotManifestToResultBridge {
  const record = loadScreenshotCaptureManifestRecord();
  const summary = summarizeScreenshotCaptureManifestRecord(record);

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (record.status === 'unchecked') {
    blockers.push('manifest確認記録がまだuncheckedです。Phase 10.25で確認結果を記録してください。');
  }
  if (record.status === 'failed') {
    blockers.push('manifest確認記録がfailedです。manifestとPNGを再確認してください。');
  }
  if (!record.capturedCount) {
    blockers.push('capturedCountが未入力です。manifest確認記録に入力してください。');
  }
  const failedNum = Number.parseInt(record.failedCount || '0', 10);
  if (Number.isFinite(failedNum) && failedNum > 0) {
    blockers.push(`failedCount が ${record.failedCount} です。0になるまでUIチェックへ進みません。`);
  }
  if (!record.workflowRunUrl) {
    blockers.push('workflowRunUrlが未入力です。manifest確認記録に入力してください。');
  }

  if (record.status === 'warn') {
    warnings.push('manifest確認記録にwarnがあります。内容を確認してからScreenshot Result Recordへ転記してください。');
  }
  if (record.visualQuickLookResult === 'warn') {
    warnings.push('目視ざっくり確認がwarnです。スクショの見た目に注意点があります。');
  }
  if (record.privateInfoResult === 'warn') {
    warnings.push('private情報確認がwarnです。転記前にprivate情報の扱いを確認してください。');
  }

  let status: ScreenshotManifestToResultBridgeStatus;

  if (blockers.length > 0) {
    status = 'blocked';
  } else if (warnings.length > 0 || record.status === 'warn') {
    status = 'needs-review';
  } else if (summary.canProceedToUiCheck) {
    status = 'ready-to-copy';
  } else {
    status = 'blocked';
  }

  const suggestedResultStatus: 'success' | 'warn' | 'failed' | 'unchecked' =
    summary.status === 'success' ? 'success'
      : summary.status === 'warn' ? 'warn'
        : summary.status === 'failed' ? 'failed'
          : 'unchecked';

  const message =
    status === 'ready-to-copy'
      ? 'manifest確認記録はsuccessです。Screenshot Result Recordへの転記候補が揃っています。'
      : status === 'needs-review'
        ? 'warnがあります。内容を確認してからScreenshot Result Recordへ転記してください。'
        : 'blockerがあります。manifest確認記録を完了してから転記候補を確認してください。';

  return {
    title: 'Screenshot Manifest → Result Bridge',
    status,
    message,
    source: {
      workflowRunUrl: record.workflowRunUrl,
      artifactUrl: record.artifactUrl,
      artifactName: record.artifactName,
      manifestFileName: record.manifestFileName,
      capturedCount: record.capturedCount,
      failedCount: record.failedCount,
    },
    suggestedResultRecord: {
      resultStatus: suggestedResultStatus,
      artifactUrl: record.artifactUrl,
      capturedCount: record.capturedCount,
      failedCount: record.failedCount,
      notes: record.notes,
    },
    blockers,
    warnings,
    nextActions: status === 'ready-to-copy'
      ? [
          'Screenshot Result Recordパネルを開き、以下の転記候補を参考に記録を入力してください。',
          `resultStatus: ${suggestedResultStatus}`,
          `capturedCount: ${record.capturedCount || '未入力'}`,
          `failedCount: ${record.failedCount || '0'}`,
          `artifactUrl: ${record.artifactUrl || '未入力'}`,
        ]
      : status === 'needs-review'
        ? [
            'warnの内容を確認した上でScreenshot Result Recordへ転記してください。',
            'privateInfoResult / visualQuickLookResultの詳細をnotesに記録してください。',
          ]
        : [
            'Phase 10.25のScreenshot Capture Manifest Recordパネルで確認結果を完成させてください。',
            'capturedCount / failedCount / workflowRunUrl を入力してください。',
            'status / 各結果 をsuccess / warn / failedで記録してください。',
          ],
  };
}

export function formatScreenshotManifestToResultBridge(bridge: ScreenshotManifestToResultBridge): string {
  const lines: string[] = [
    `# ${bridge.title}`,
    '',
    bridge.message,
    '',
    `- status: ${bridge.status}`,
    '',
    '## 転記元 (Source)',
    `- workflowRunUrl: ${bridge.source.workflowRunUrl || '未入力'}`,
    `- artifactUrl: ${bridge.source.artifactUrl || '未入力'}`,
    `- artifactName: ${bridge.source.artifactName}`,
    `- manifestFileName: ${bridge.source.manifestFileName}`,
    `- capturedCount: ${bridge.source.capturedCount || '未入力'}`,
    `- failedCount: ${bridge.source.failedCount || '未入力'}`,
    '',
    '## 転記候補 (Suggested Result Record)',
    `- resultStatus: ${bridge.suggestedResultRecord.resultStatus}`,
    `- artifactUrl: ${bridge.suggestedResultRecord.artifactUrl || '未入力'}`,
    `- capturedCount: ${bridge.suggestedResultRecord.capturedCount || '未入力'}`,
    `- failedCount: ${bridge.suggestedResultRecord.failedCount || '未入力'}`,
    `- notes: ${bridge.suggestedResultRecord.notes || 'なし'}`,
  ];

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
    '- Screenshot Result Recordへの自動保存はしません。',
    '- artifactの自動取得・画像解析はしません。',
    '- この転記はすべて手動で行います。',
  );

  return lines.join('\n');
}
