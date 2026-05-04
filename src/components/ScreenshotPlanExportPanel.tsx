import { useMemo, useState } from 'react';
import { Check, Copy, FileJson, RefreshCcw } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import {
  buildScreenshotPlanExport,
  formatScreenshotPlanExport,
  summarizeScreenshotPlanExport,
} from '../utils/screenshotPlanExport';

export function ScreenshotPlanExportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const plan = useMemo(() => {
    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    return buildScreenshotPlanExport(screenshotDraft);
  }, [reloadKey]);

  const formattedPlan = useMemo(() => formatScreenshotPlanExport(plan), [plan]);
  const summary = useMemo(() => summarizeScreenshotPlanExport(plan), [plan]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedPlan);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="screenshotPlanExportPanel">
      <div className={`screenshotPlanHero export-${plan.status}`}>
        <FileJson />
        <div>
          <p className="eyebrow">Phase 10.9</p>
          <h3>Screenshot Plan Export</h3>
          <p>保存済みPreview URLとターゲットキューを、外部実行へ渡せるJSON下書きに変換します。まだ実行はしません。</p>
        </div>
      </div>

      <div className="screenshotPlanSafetyBox">
        <strong>JSON下書きのみ</strong>
        <p>この段階ではGitHub Actionsや外部ワーカーを起動しません。コピーしたJSONを、次のPhaseで安全ゲート付き実行へ渡せるようにします。</p>
      </div>

      <div className="screenshotPlanControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 最新計画を再生成
        </button>
        <button type="button" className={`screenshotPlanCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'JSONをコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'JSON下書きをコピー'}
        </button>
        <span>{plan.status}</span>
      </div>

      <div className="screenshotPlanSummaryGrid">
        {summary.map((item) => {
          const [label, value] = item.split(': ');
          return (
            <section key={item}>
              <h4>{label}</h4>
              <p>{value}</p>
            </section>
          );
        })}
      </div>

      <div className="screenshotPlanTargetBox">
        <div>
          <strong>Export Targets</strong>
          <span>{plan.targets.length} ready</span>
        </div>
        <div className="screenshotPlanTargetList">
          {plan.targets.map((target) => (
            <article className="screenshotPlanTargetItem" key={target.id}>
              <div>
                <strong>{target.label}</strong>
                <span>{target.outputName}</span>
              </div>
              <p>{target.url}</p>
              <small>{target.viewport.width} × {target.viewport.height}</small>
            </article>
          ))}
          {plan.targets.length === 0 && <p>readyなターゲットがありません。Preview URL記録を確認してください。</p>}
        </div>
      </div>

      <div className="screenshotPlanBlockedBox">
        <div>
          <strong>Blocked Targets</strong>
          <span>{plan.blockedTargets.length} blocked</span>
        </div>
        <div className="screenshotPlanBlockedList">
          {plan.blockedTargets.map((target) => (
            <article className="screenshotPlanBlockedItem" key={target.id}>
              <div>
                <strong>{target.label}</strong>
                <span>{target.status}</span>
              </div>
              <p>{target.note}</p>
            </article>
          ))}
          {plan.blockedTargets.length === 0 && <p>blocked targetはありません。</p>}
        </div>
      </div>

      <div className="screenshotPlanJsonBox">
        <div>
          <strong>JSON Preview</strong>
          <span>draft-only</span>
        </div>
        <pre>{formattedPlan}</pre>
      </div>
    </div>
  );
}
