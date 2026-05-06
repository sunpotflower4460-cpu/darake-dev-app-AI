import { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import {
  buildAiReviewToCloudAgentBridge,
  formatAiReviewToCloudAgentBridgeMarkdown,
} from '../utils/aiReviewToCloudAgentBridge';
import { loadAiReviewTriageItems } from '../utils/aiReviewResultTriage';
import { loadManualAiReviewSessions } from '../utils/manualAiReviewSession';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiReviewToCloudAgentBridgePanel() {
  const [sessions] = useState(() => loadManualAiReviewSessions());
  const [triageItems] = useState(() => loadAiReviewTriageItems());
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [targetRepo, setTargetRepo] = useState('');
  const [phaseLabel, setPhaseLabel] = useState('');
  const [targetFiles, setTargetFiles] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const bridge = selectedSession
    ? buildAiReviewToCloudAgentBridge({
        sessionTitle: selectedSession.title,
        triageItems,
        targetFiles: targetFiles.split('\n').map((l) => l.trim()).filter(Boolean),
        targetRepo: targetRepo || '(未入力)',
        phaseLabel: phaseLabel || '(未入力)',
      })
    : null;

  async function handleCopy() {
    if (!bridge) return;
    try {
      await navigator.clipboard.writeText(formatAiReviewToCloudAgentBridgeMarkdown(bridge));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase27Panel">
      <div className="phase27Hero">
        <ArrowLeftRight />
        <div>
          <p className="eyebrow">Phase 29.4</p>
          <h3>AI Review → Cloud Agent Bridge</h3>
          <p>AIレビュー結果からCloud Agent指示書を作ります。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ Cloud Agent への自動送信はしません。指示書をコピーして人間が渡してください。
      </div>

      <div className="phase27Section">
        <h4>AIレビューセッションを選択</h4>
        <select className="phase27Select" value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
          <option value="">セッションを選択…</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.title} ({s.status})</option>)}
        </select>
      </div>

      <div className="phase27Section">
        <h4>targetRepo</h4>
        <input className="phase27Input" placeholder="owner/repo" value={targetRepo} onChange={(e) => setTargetRepo(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>phaseLabel</h4>
        <input className="phase27Input" placeholder="Phase 27" value={phaseLabel} onChange={(e) => setPhaseLabel(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>対象ファイル（1行1件）</h4>
        <textarea className="phase27Textarea" rows={3} placeholder="src/components/Foo.tsx&#10;src/utils/bar.ts" value={targetFiles} onChange={(e) => setTargetFiles(e.target.value)} />
      </div>

      <div className="phase27Section">
        <h4>使用中のTriageアイテム数</h4>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{triageItems.filter((i) => i.action !== 'ignore').length}</p>
      </div>

      {bridge && (
        <>
          <div className="phase27SummaryGrid">
            <section>
              <h4>status</h4>
              <span className={`phase27StatusBadge ${bridge.status}`}>{bridge.status}</span>
            </section>
            <section>
              <h4>risk notes</h4>
              <p style={{ fontSize: '1.3rem', fontWeight: 800 }}>{bridge.riskNotes.length}</p>
            </section>
          </div>

          <div className="phase27Section">
            <h4>指示書プレビュー</h4>
            <div className="phase27CodeBlock" style={{ maxHeight: 200, overflow: 'auto' }}>
              {bridge.instructionBody}
            </div>
          </div>

          {bridge.riskNotes.length > 0 && (
            <div className="phase27Section">
              <h4>Risk Notes</h4>
              <ul className="phase27BlockerList">
                {bridge.riskNotes.map((r, i) => <li key={i}>⚠️ {r}</li>)}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="phase27BtnRow">
        <button className={`phase27CopyBtn ${copyState}`} disabled={!bridge} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '指示書コピー'}
        </button>
      </div>
    </div>
  );
}
