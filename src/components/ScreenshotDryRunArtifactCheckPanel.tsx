import { useMemo, useState } from 'react';
import { Archive, Check, Copy, RefreshCcw } from 'lucide-react';
import {
  buildDryRunArtifactCheckGuide,
  formatDryRunArtifactCheckGuide,
} from '../utils/screenshotDryRunArtifactCheck';

export function ScreenshotDryRunArtifactCheckPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const guide = useMemo(() => buildDryRunArtifactCheckGuide(), [reloadKey]);
  const formattedGuide = useMemo(() => formatDryRunArtifactCheckGuide(guide), [guide]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedGuide);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="screenshotArtifactCheckPanel">
      <div className="screenshotArtifactHero">
        <Archive />
        <div>
          <p className="eyebrow">Phase 10.14</p>
          <h3>Dry-run Artifact Check</h3>
          <p>dry-run workflow実行後に、どのartifactを見て、何が入っていれば成功かを確認するための手順カードです。</p>
        </div>
      </div>

      <div className="screenshotArtifactSafetyBox">
        <strong>まだ自動取得しません</strong>
        <p>この段階ではartifactの自動取得・ダウンロード・解析は行いません。GitHub上で人間が確認するためのチェックリストです。</p>
      </div>

      <div className="screenshotArtifactControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> チェック内容を再表示
        </button>
        <button type="button" className={`screenshotArtifactCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && 'チェック内容をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && 'チェック内容をコピー'}
        </button>
        <span>{guide.status}</span>
      </div>

      <div className="screenshotArtifactSummaryGrid">
        <section>
          <h4>Workflow</h4>
          <p>{guide.workflowName}</p>
        </section>
        <section>
          <h4>Artifact</h4>
          <p>{guide.artifactName}</p>
        </section>
        <section>
          <h4>File</h4>
          <p>{guide.artifactFileName}</p>
        </section>
      </div>

      <div className="screenshotArtifactChecklistGrid">
        <section>
          <h4>成功条件</h4>
          {guide.successConditions.map((item) => (
            <article key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.expected}</span>
              <p>{item.why}</p>
            </article>
          ))}
        </section>
        <section>
          <h4>中身を見る項目</h4>
          {guide.inspectItems.map((item) => (
            <article key={item.id}>
              <strong>{item.label}</strong>
              <span>{item.expected}</span>
              <p>{item.why}</p>
            </article>
          ))}
        </section>
      </div>

      <div className="screenshotArtifactBottomGrid">
        <section>
          <h4>止める条件</h4>
          {guide.stopIf.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>次の行動</h4>
          {guide.nextActions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Safety Notes</h4>
          {guide.safetyNotes.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </div>
  );
}
