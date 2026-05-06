import { useMemo, useState } from 'react';
import { Check, Copy, Rocket, RefreshCcw } from 'lucide-react';
import { buildSubmissionControlRoom } from '../utils/submissionControlRoom';

type SectionStatus = 'pass' | 'warn' | 'fail' | 'unchecked';

const STATUS_ICON: Record<SectionStatus, string> = {
  pass: '✅',
  warn: '⚠️',
  fail: '🔴',
  unchecked: '❓',
};

export function SubmissionControlRoomPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const room = useMemo(() => buildSubmissionControlRoom(), [reloadKey]);

  function handleReload() {
    setReloadKey((k) => k + 1);
    setCopyState('idle');
  }

  async function handleCopy() {
    const text = [
      `# ${room.title}`,
      '',
      `- status: ${room.status}`,
      '',
      room.message,
      '',
      '## セクション',
      ...room.sections.map((s) => `- ${STATUS_ICON[s.status]} ${s.label}: ${s.detail}`),
      '',
      '## 手動ゲート',
      ...room.manualGates.map((g) => `- 🔒 ${g}`),
      '',
      '## 次のアクション',
      ...room.nextActions.map((a) => `- ${a}`),
    ].join('\n');
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
    <div className="submissionControlRoomPanel">
      <div className={`submissionControlRoomHero submissionControlRoom-${room.status}`}>
        <Rocket />
        <div>
          <p className="eyebrow">Phase 13.1</p>
          <h3>提出管制室 / Submission Control Room</h3>
          <p>{room.message}</p>
        </div>
      </div>

      <div className="submissionControlRoomSafetyBox">
        <strong>Submit for Reviewは人間が行います</strong>
        <p>このアプリはApp Store Connect APIを呼びません。Submit for Reviewは必ず人間が行います。</p>
      </div>

      <div className="submissionControlRoomControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`submissionControlRoomCopyButton copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
        <span className={`submissionControlRoomStatusBadge submissionStatus-${room.status}`}>{room.status}</span>
      </div>

      <div className="submissionControlRoomSections">
        {room.sections.map((section) => (
          <div key={section.id} className={`submissionControlRoomSection sectionStatus-${section.status}`}>
            <span className="submissionSectionIcon">{STATUS_ICON[section.status]}</span>
            <div>
              <strong>{section.label}</strong>
              <p>{section.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="submissionControlRoomManualBox">
        <strong>🔒 手動ゲート</strong>
        <ul>
          {room.manualGates.map((g) => <li key={g}>{g}</li>)}
        </ul>
      </div>

      <div className="submissionControlRoomActionsBox">
        <strong>次のアクション</strong>
        <ul>
          {room.nextActions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
}
