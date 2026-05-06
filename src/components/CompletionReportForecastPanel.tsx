import { useState } from 'react';
import { TrendingUp, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { buildCompletionReportForecast } from '../utils/completionReportForecast';

type CopyState = 'idle' | 'copied' | 'failed';

export function CompletionReportForecastPanel() {
  const [candidateTitle, setCandidateTitle] = useState('');
  const [wouldCompleteText, setWouldCompleteText] = useState('');
  const [wouldRemainText, setWouldRemainText] = useState('');
  const [wouldNeedHumanText, setWouldNeedHumanText] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [forecasts, setForecasts] = useState<ReturnType<typeof buildCompletionReportForecast>[]>([]);

  function parseLines(text: string): string[] {
    return text.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  function handleGenerate() {
    if (!candidateTitle.trim()) return;
    const f = buildCompletionReportForecast(
      candidateTitle.trim(),
      parseLines(wouldCompleteText),
      parseLines(wouldRemainText),
      parseLines(wouldNeedHumanText)
    );
    setForecasts([f, ...forecasts]);
    setCandidateTitle('');
    setWouldCompleteText('');
    setWouldRemainText('');
    setWouldNeedHumanText('');
  }

  function handleDelete(index: number) {
    setForecasts(forecasts.filter((_, i) => i !== index));
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const statusLabel: Record<string, string> = {
    'likely-success': '✅ 成功見込み',
    'likely-needs-review': '⚠️ 確認必要',
    'likely-blocked': '🚫 ブロック見込み',
  };

  return (
    <div className="phase32Panel">
      <div className="phase32Hero">
        <TrendingUp />
        <div>
          <p className="eyebrow">Phase 32.4</p>
          <h3>Completion Report Forecast</h3>
          <p>進めた場合の完了レポートを予測します。実行しません。</p>
        </div>
      </div>

      <div className="phase32SafetyBox">
        ⛔ これは予測だけです。外部APIを呼びません。
      </div>

      <div className="phase32Section">
        <h4>新しい予測を作成</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            className="phase32Input"
            placeholder="候補タイトル *"
            value={candidateTitle}
            onChange={(e) => setCandidateTitle(e.target.value)}
          />
          <textarea
            className="phase32Textarea"
            rows={2}
            placeholder="完了見込み（1行1件）"
            value={wouldCompleteText}
            onChange={(e) => setWouldCompleteText(e.target.value)}
          />
          <textarea
            className="phase32Textarea"
            rows={2}
            placeholder="残り課題（1行1件）"
            value={wouldRemainText}
            onChange={(e) => setWouldRemainText(e.target.value)}
          />
          <textarea
            className="phase32Textarea"
            rows={2}
            placeholder="人間対応が必要（1行1件）"
            value={wouldNeedHumanText}
            onChange={(e) => setWouldNeedHumanText(e.target.value)}
          />
          <button className="phase32SmallBtn" onClick={handleGenerate}>
            <Plus size={14} /> 予測を生成
          </button>
        </div>
      </div>

      {forecasts.length === 0 ? (
        <div className="phase32Section">
          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0 }}>
            予測がありません。上のフォームから生成してください。
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {forecasts.map((f, i) => (
            <div key={i} className="phase32SimCard">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h4 className="phase32SimTitle">{f.title}</h4>
                <span className={`phase32StatusBadge ${f.status}`}>
                  {statusLabel[f.status] ?? f.status}
                </span>
              </div>

              {f.wouldComplete.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.76rem', fontWeight: 700, margin: '0 0 4px' }}>完了見込み</p>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', display: 'grid', gap: 2 }}>
                    {f.wouldComplete.map((c, j) => <li key={j}>✅ {c}</li>)}
                  </ul>
                </div>
              )}
              {f.wouldNeedHuman.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.76rem', fontWeight: 700, margin: '0 0 4px' }}>人間対応必要</p>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', display: 'grid', gap: 2 }}>
                    {f.wouldNeedHuman.map((h, j) => <li key={j}>👤 {h}</li>)}
                  </ul>
                </div>
              )}
              {f.wouldRemain.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.76rem', fontWeight: 700, margin: '0 0 4px' }}>残り課題</p>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', display: 'grid', gap: 2 }}>
                    {f.wouldRemain.map((r, j) => <li key={j}>📋 {r}</li>)}
                  </ul>
                </div>
              )}

              <div className="phase32BtnRow">
                <button
                  className={`phase32SmallBtn ${copyState}`}
                  onClick={() => void handleCopy(f.forecastMarkdown)}
                >
                  {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} MDコピー
                </button>
                <button className="phase32SmallBtn" onClick={() => handleDelete(i)} style={{ color: '#992020' }}>
                  <Trash2 size={13} /> 削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
