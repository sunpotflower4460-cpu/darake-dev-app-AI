import { useState } from 'react';
import { Check, Copy, List } from 'lucide-react';
import { AI_PROVIDER_CANDIDATES } from '../utils/aiProviderCandidates';
import { buildAiPromptPack } from '../utils/aiPromptPackBuilder';
import { AI_TASK_TYPE_REGISTRY } from '../utils/aiTaskTypeRegistry';

type CopyState = 'idle' | 'copied' | 'failed';

function statusClassName(status: 'blocked' | 'ready-to-copy' | 'needs-review') {
  if (status === 'ready-to-copy') return 'safe';
  return status;
}

export function AiPromptPackBuilderPanel() {
  const [taskType, setTaskType] = useState(AI_TASK_TYPE_REGISTRY[0]?.id ?? 'screenshot-ui-review');
  const [provider, setProvider] = useState(AI_PROVIDER_CANDIDATES[0]?.id ?? 'manual-ai');
  const [sourceContext, setSourceContext] = useState('');
  const [copyMarkdownState, setCopyMarkdownState] = useState<CopyState>('idle');
  const [copyPromptState, setCopyPromptState] = useState<CopyState>('idle');

  const pack = buildAiPromptPack(taskType, provider, sourceContext);

  async function handleCopyMarkdown() {
    try {
      await navigator.clipboard.writeText(pack.markdown);
      setCopyMarkdownState('copied');
      window.setTimeout(() => setCopyMarkdownState('idle'), 1800);
    } catch {
      setCopyMarkdownState('failed');
      window.setTimeout(() => setCopyMarkdownState('idle'), 2400);
    }
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(pack.userPrompt);
      setCopyPromptState('copied');
      window.setTimeout(() => setCopyPromptState('idle'), 1800);
    } catch {
      setCopyPromptState('failed');
      window.setTimeout(() => setCopyPromptState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <List />
        <div>
          <p className="eyebrow">Phase 25.3</p>
          <h3>AI Prompt Pack Builder</h3>
          <p>用途ごとのAI依頼書を組み立て、コピーして外部AIへ貼れる状態にします。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ AI API送信なし / 添付画像送信なし / API key入力なし</strong>
        <p>人間が内容を確認してからコピーして外部AIへ貼ってください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>Prompt設定</legend>
          <div className="phase25TwoColumn">
            <label>
              task type
              <select value={taskType} onChange={(event) => setTaskType(event.target.value as typeof taskType)}>
                {AI_TASK_TYPE_REGISTRY.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label>
              provider
              <select value={provider} onChange={(event) => setProvider(event.target.value as typeof provider)}>
                {AI_PROVIDER_CANDIDATES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Human-pasted context
            <textarea
              rows={7}
              value={sourceContext}
              onChange={(event) => setSourceContext(event.target.value)}
              placeholder="レビュー対象・下書き本文・差分要約などを貼ってください（secret/token/個人情報は除去済みにする）"
            />
          </label>
        </fieldset>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span className={`phase24StatusBadge ${statusClassName(pack.status)}`}>{pack.status}</span>
        <span className="phase25Muted">provider: {pack.provider}</span>
      </div>

      <div className="phaseWarningsBox">
        <strong>private情報チェック</strong>
        <ul>{pack.privateInfoWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
      </div>

      <div className="phaseInfoBox">
        <strong>Manual Checklist</strong>
        <ul>{pack.manualChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>

      <div className="phase25TwoColumn phase25AlignStart">
        <section className="phase25Card phase25CompactCard">
          <strong>System-like Context</strong>
          <pre className="phase25CodeBlock">{pack.systemLikeContext}</pre>
        </section>
        <section className="phase25Card phase25CompactCard">
          <strong>Expected Output Format</strong>
          <pre className="phase25CodeBlock">{pack.expectedOutputFormat}</pre>
        </section>
      </div>

      <div className="phaseInfoBox">
        <strong>AIに貼る用 Prompt</strong>
        <pre className="phase25CodeBlock">{pack.userPrompt}</pre>
      </div>

      <div className="phaseInfoBox">
        <strong>Prompt Pack Markdown</strong>
        <pre className="phase25CodeBlock">{pack.markdown}</pre>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyMarkdownState}`} onClick={handleCopyMarkdown}>
          {copyMarkdownState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyMarkdownState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyPromptState}`} onClick={handleCopyPrompt}>
          {copyPromptState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyPromptState === 'copied' ? 'コピー済み' : 'AIに貼る用コピー'}
        </button>
      </div>
    </div>
  );
}
