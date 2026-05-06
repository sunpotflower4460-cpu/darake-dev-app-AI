import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Home, RefreshCcw } from 'lucide-react';
import { loadAppRegistry } from '../utils/appRegistry';
import { loadReleaseRecords } from '../utils/releaseRecord';
import { loadFeedbacks } from '../utils/postReleaseFeedbackRecord';
import { buildDarakeHomeSummary } from '../utils/darakeHomeSummary';

type CopyState = 'idle' | 'copied' | 'failed';

export function DarakeHomeSummaryPanel() {
  const [apps, setApps] = useState(loadAppRegistry());
  const [releases, setReleases] = useState(loadReleaseRecords());
  const [feedbacks, setFeedbacks] = useState(loadFeedbacks());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setApps(loadAppRegistry());
    setReleases(loadReleaseRecords());
    setFeedbacks(loadFeedbacks());
  }, [reloadKey]);

  const summary = useMemo(() => buildDarakeHomeSummary(apps, releases, feedbacks), [apps, releases, feedbacks]);

  async function handleCopy() {
    const text = [
      '# だらけ管制室 Home Summary',
      '',
      `## ${summary.darakeComment}`,
      '',
      summary.todayItems.length > 0 ? `## 今日見るべきもの\n${summary.todayItems.map((i) => `- ${i}`).join('\n')}` : '',
      summary.blockedItems.length > 0 ? `## 止まっているもの\n${summary.blockedItems.map((i) => `- ${i}`).join('\n')}` : '',
      summary.nearComplete.length > 0 ? `## 完成間近\n${summary.nearComplete.map((i) => `- ${i}`).join('\n')}` : '',
      summary.preSubmission.length > 0 ? `## 提出前\n${summary.preSubmission.map((i) => `- ${i}`).join('\n')}` : '',
      summary.nextToBuild.length > 0 ? `## 次に作る候補\n${summary.nextToBuild.map((i) => `- ${i}`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase18Panel">
      <div className="phase18Hero">
        <Home />
        <div>
          <p className="eyebrow">Phase 18.5</p>
          <h3>だらけ Home サマリー</h3>
          <p>最初に開いた時に「今どこを見るべきか」だけ出します。</p>
        </div>
      </div>

      <div className="darakeHomeComment">{summary.darakeComment}</div>

      {summary.todayItems.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>📍 今日見るべきもの ({summary.todayItems.length}件)</strong>
          <ul>{summary.todayItems.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      {summary.blockedItems.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>🔴 止まっているもの</strong>
          <ul>{summary.blockedItems.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      {summary.nearComplete.length > 0 && (
        <div className="phaseInfoBox">
          <strong>🎉 完成間近</strong>
          <ul>{summary.nearComplete.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      {summary.preSubmission.length > 0 && (
        <div className="phaseInfoBox">
          <strong>📦 提出前</strong>
          <ul>{summary.preSubmission.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      {summary.nextToBuild.length > 0 && (
        <div className="phaseInfoBox">
          <strong>💡 次に作る候補</strong>
          <ul>{summary.nextToBuild.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      {apps.length === 0 && (
        <div className="phaseInfoBox">
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>アプリが登録されていません。Phase 16.2のApp Registry Panelで最初のアプリを登録してみましょう。</p>
        </div>
      )}

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
