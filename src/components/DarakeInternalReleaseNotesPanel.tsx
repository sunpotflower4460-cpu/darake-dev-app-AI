import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { buildDarakeInternalReleaseNotes } from '../utils/darakeInternalReleaseNotes';

const notes = buildDarakeInternalReleaseNotes();

export function DarakeInternalReleaseNotesPanel() {
  const [showWontDo, setShowWontDo] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(notes.releaseMarkdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase44Panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <strong style={{ fontSize: '1rem' }}>内部リリースノート</strong>
        <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: 'auto' }}>{notes.version}</span>
      </div>

      <div style={{ background: '#f0f9e8', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>✅ できること</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {notes.whatYouCanDo.map((w, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#444', marginBottom: 3 }}>{w}</li>
          ))}
        </ul>
      </div>

      <div style={{ background: '#fff8e1', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>🔒 安全方針</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {notes.safetyPolicy.map((s, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#555', marginBottom: 3 }}>{s}</li>
          ))}
        </ul>
      </div>

      <div style={{ background: '#e8f4fd', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>🚀 次のPhase候補</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {notes.nextPhaseCandidates.map((n, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#1976d2', marginBottom: 3 }}>{n}</li>
          ))}
        </ul>
      </div>

      <div className="phase44BtnRow">
        <button className="phase44Btn" onClick={() => setShowWontDo((v) => !v)}>
          {showWontDo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showWontDo ? '閉じる' : 'まだやらないことを見る'}
        </button>
        <button className="phase44Btn" onClick={() => setShowLimits((v) => !v)}>
          {showLimits ? '閉じる' : '既知の制限を見る'}
        </button>
        <button className="phase44Btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>

      {showWontDo && (
        <div style={{ marginTop: 10, background: '#fafafa', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>まだやらないこと</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {notes.whatWeWontDoYet.map((w, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#888' }}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {showLimits && (
        <div style={{ marginTop: 10, background: '#fafafa', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>既知の制限</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {notes.knownLimitations.map((k, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: '#888' }}>{k}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
