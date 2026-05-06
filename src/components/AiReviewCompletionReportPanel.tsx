import { useMemo, useState } from 'react';
import { Check, Copy, RefreshCcw, Microscope } from 'lucide-react';
import {
  buildAiReviewCompletionReport,
  formatAiReviewCompletionReportMarkdown,
} from '../utils/aiReviewCompletionReport';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiReviewCompletionReportPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const report = useMemo(() => buildAiReviewCompletionReport(), [reloadKey]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAiReviewCompletionReportMarkdown(report));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase21Panel">
      <div className="phase21Hero">
        <Microscope />
        <div>
          <p className="eyebrow">Phase 21.6</p>
          <h3>AIレビュー統合 完成レポート</h3>
          <p>AIレビューの整備状況を確認します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部AI API自動実行なし</strong>
      </div>

      <div className="phaseSummaryGrid">
        <section>
          <h4>✅ 通過</h4>
          <p>{report.passedCount}</p>
        </section>
        <section>
          <h4>⚠️ 警告</h4>
          <p>{report.warnCount}</p>
        </section>
        <section>
          <h4>❌ 失敗</h4>
          <p>{report.failedCount}</p>
        </section>
      </div>

      {report.uncheckedCount > 0 && (
        <div className="phaseWarningsBox">
          <strong>⬜ 未確認: {report.uncheckedCount}件</strong>
          <p>AIレビューがまだ実施されていない対象があります。</p>
        </div>
      )}

      {report.blockers.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>Blockers</strong>
          <ul>{report.blockers.map((b, i) => <li key={i}>🔴 {b}</li>)}</ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>Warnings</strong>
          <ul>{report.warnings.map((w, i) => <li key={i}>⚠️ {w}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>レビュー済み対象</strong>
        {report.reviewedTargets.length > 0 ? (
          <ul>{report.reviewedTargets.map((t, i) => <li key={i}>{t}</li>)}</ul>
        ) : (
          <p>なし（まだレビューを実施していません）</p>
        )}
      </div>

      <div className="phaseInfoBox">
        <strong>修正Issue下書き: {report.fixIssueDraftCount}件</strong>
      </div>

      <div className="phaseInfoBox">
        <strong>次のおすすめ</strong>
        <ul>{report.nextRecommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
