import { useState } from 'react';
import { Bot, Check, Copy } from 'lucide-react';
import {
  AI_PROVIDER_CANDIDATES,
  formatAiProviderCandidatesMarkdown,
} from '../utils/aiProviderCandidates';

type CopyState = 'idle' | 'copied' | 'failed';

export function AiProviderCandidatePanel() {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const apiCandidateCount = AI_PROVIDER_CANDIDATES.filter((candidate) => candidate.status === 'api-candidate').length;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatAiProviderCandidatesMarkdown(AI_PROVIDER_CANDIDATES));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <Bot />
        <div>
          <p className="eyebrow">Phase 25.1</p>
          <h3>AI Provider Candidate</h3>
          <p>どのAIを何用途で使うかを manual copy 前提で整理します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ AI APIは呼びません / API key入力欄は作りません / secretは保存しません</strong>
        <p>この一覧は候補整理用です。実行は人間がコピーして外部AIへ貼る方式のみです。</p>
      </div>

      <div className="phase24SummaryGrid">
        <section>
          <h4>Total</h4>
          <p>{AI_PROVIDER_CANDIDATES.length}</p>
        </section>
        <section>
          <h4>API候補</h4>
          <p>{apiCandidateCount}</p>
        </section>
        <section>
          <h4>Manual only</h4>
          <p>{AI_PROVIDER_CANDIDATES.filter((candidate) => candidate.status === 'manual-copy-only').length}</p>
        </section>
        <section>
          <h4>Blocked</h4>
          <p className={AI_PROVIDER_CANDIDATES.some((candidate) => candidate.status === 'blocked') ? 'warn' : ''}>
            {AI_PROVIDER_CANDIDATES.filter((candidate) => candidate.status === 'blocked').length}
          </p>
        </section>
      </div>

      <div className="phase25Grid">
        {AI_PROVIDER_CANDIDATES.map((candidate) => (
          <section key={candidate.id} className="phase25Card">
            <div className="phase25CardHeader">
              <div>
                <h4>{candidate.label}</h4>
                <p className="phase25Muted">{candidate.id}</p>
              </div>
              <span className={`phase25Badge phase25Badge-${candidate.status}`}>{candidate.status}</span>
            </div>
            <div className="phase25MetaRow">
              <span>requiresApiKey: {candidate.requiresApiKey ? 'yes' : 'no'}</span>
              <span>secretPolicy: {candidate.secretPolicy}</span>
            </div>
            <div className="phase25TwoColumn">
              <div>
                <strong>bestFor</strong>
                <ul className="phase25List">
                  {candidate.bestFor.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <strong>weakFor</strong>
                <ul className="phase25List">
                  {candidate.weakFor.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <p className="phase25Note">{candidate.notes}</p>
          </section>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
