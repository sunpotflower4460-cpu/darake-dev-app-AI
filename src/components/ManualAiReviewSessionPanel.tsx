import { useState } from 'react';
import { MessageSquare, Copy, Check, Plus, Trash2 } from 'lucide-react';
import {
  buildManualAiReviewSession,
  loadManualAiReviewSessions,
  saveManualAiReviewSessions,
  updateManualAiReviewSession,
  formatManualAiReviewSessionMarkdown,
} from '../utils/manualAiReviewSession';
import type { ManualAiReviewSessionStatus } from '../utils/manualAiReviewSession';

type CopyState = 'idle' | 'copied' | 'failed';

const STATUS_OPTIONS: ManualAiReviewSessionStatus[] = [
  'draft', 'prompt-copied', 'waiting-result', 'result-pasted', 'triaged', 'issue-drafted', 'done',
];

export function ManualAiReviewSessionPanel() {
  const [sessions, setSessions] = useState(() => loadManualAiReviewSessions());
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('ChatGPT');
  const [taskType, setTaskType] = useState('code-review');
  const [prompt, setPrompt] = useState('');
  const [expectedFormat, setExpectedFormat] = useState('Markdown リスト');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function save(updated: ReturnType<typeof loadManualAiReviewSessions>) {
    saveManualAiReviewSessions(updated);
    setSessions(updated);
  }

  function handleAdd() {
    const session = buildManualAiReviewSession({
      title: title || '(未入力)',
      prompt,
      provider,
      taskType,
      expectedOutputFormat: expectedFormat,
    });
    save([session, ...sessions]);
    setTitle(''); setPrompt('');
  }

  function handleDelete(id: string) {
    save(sessions.filter((s) => s.id !== id));
  }

  function handleStatusChange(id: string, status: ManualAiReviewSessionStatus) {
    save(updateManualAiReviewSession(sessions, id, { status }));
  }

  function handleResultChange(id: string, resultText: string) {
    save(updateManualAiReviewSession(sessions, id, { resultText, status: 'result-pasted' }));
  }

  async function handleCopy(text: string, id?: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1800);
        // auto-advance status to prompt-copied
        const s = sessions.find((s) => s.id === id);
        if (s && s.status === 'draft') {
          save(updateManualAiReviewSession(sessions, id, { status: 'prompt-copied' }));
        }
      } else {
        setCopyState('copied');
        window.setTimeout(() => setCopyState('idle'), 1800);
      }
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="phase27Panel">
      <div className="phase27Hero">
        <MessageSquare />
        <div>
          <p className="eyebrow">Phase 29.1 / 29.2</p>
          <h3>Manual AI Review Session</h3>
          <p>AIレビューを手動コピペで回します。AI API は呼びません。</p>
        </div>
      </div>

      <div className="phase27SafetyBox">
        ⛔ AI API は呼びません。プロンプトをコピーして人間がAIに貼り付け、結果をここにペーストしてください。
      </div>

      <div className="phase27SummaryGrid">
        <section><h4>合計</h4><p>{sessions.length}</p></section>
        <section><h4>待機中</h4><p>{sessions.filter((s) => s.status === 'waiting-result' || s.status === 'prompt-copied').length}</p></section>
        <section><h4>完了</h4><p>{sessions.filter((s) => s.status === 'done').length}</p></section>
      </div>

      <div className="phase27Section">
        <h4>新規セッション</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="phase27Input" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="phase27Input" placeholder="AI provider (ChatGPT / Claude / Gemini)" value={provider} onChange={(e) => setProvider(e.target.value)} />
          <input className="phase27Input" placeholder="taskType (code-review / ui-check / ...)" value={taskType} onChange={(e) => setTaskType(e.target.value)} />
          <input className="phase27Input" placeholder="expected output format" value={expectedFormat} onChange={(e) => setExpectedFormat(e.target.value)} />
          <textarea className="phase27Textarea" rows={5} placeholder="プロンプト（AIへ渡す文章）" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div className="phase27BtnRow">
            <button className="phase27SmallBtn" onClick={handleAdd}><Plus size={14} /> 追加</button>
            {prompt && (
              <button className={`phase27SmallBtn ${copyState}`} onClick={() => void handleCopy(prompt)}>
                {copyState === 'copied' ? <Check size={14} /> : <Copy size={14} />} プロンプトコピー
              </button>
            )}
          </div>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="phase27Section">
          <h4>セッション一覧</h4>
          <div style={{ display: 'grid', gap: 12 }}>
            {sessions.map((s) => (
              <div key={s.id} className="phase27RecordCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ flex: 1, fontSize: '0.88rem' }}>{s.title}</strong>
                  <span className={`phase27StatusBadge ${s.status === 'done' ? 'ready-to-copy' : s.status === 'draft' ? 'draft' : 'needs-review'}`}>{s.status}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.provider} · {s.taskType}</p>

                <div className="phase27BtnRow">
                  <button className={`phase27SmallBtn ${copiedId === s.id ? 'copied' : ''}`} onClick={() => void handleCopy(s.prompt, s.id)}>
                    {copiedId === s.id ? <Check size={13} /> : <Copy size={13} />} プロンプトコピー
                  </button>
                  <button className="phase27SmallBtn" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                    {expandedId === s.id ? '▲ 閉じる' : '▼ 展開'}
                  </button>
                  <button className="phase27SmallBtn" onClick={() => handleDelete(s.id)} style={{ color: '#992020' }}>
                    <Trash2 size={13} /> 削除
                  </button>
                </div>

                {expandedId === s.id && (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: '0.76rem', fontWeight: 700, marginBottom: 4 }}>status 更新</p>
                      <select className="phase27Select" value={s.status} onChange={(e) => handleStatusChange(s.id, e.target.value as ManualAiReviewSessionStatus)}>
                        {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.76rem', fontWeight: 700, marginBottom: 4 }}>AI結果をペースト</p>
                      <textarea
                        className="phase27Textarea"
                        rows={5}
                        placeholder="AIからの返答をここにペーストする"
                        value={s.resultText}
                        onChange={(e) => handleResultChange(s.id, e.target.value)}
                      />
                    </div>
                    <button className="phase27SmallBtn" onClick={() => void handleCopy(formatManualAiReviewSessionMarkdown(s))}>
                      <Copy size={13} /> Markdownコピー
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
