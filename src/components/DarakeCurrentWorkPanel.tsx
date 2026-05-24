import '../darakeCurrentWork.css';
import {
  hasActiveWorkSession,
  loadCurrentWorkSession,
  type DarakeWorkSession,
} from '../utils/darakeWorkSession';

function navigateToGroup(group: string) {
  try {
    localStorage.setItem('darake.navGroup.v1', group);
    window.dispatchEvent(new StorageEvent('storage', { key: 'darake.navGroup.v1', newValue: group }));
  } catch {
    // ignore
  }
}

function openUrl(url: string | null) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function resolveNextAction(session: DarakeWorkSession): (() => void) | null {
  if (session.nextActionLabel.includes('Issue') && session.issueUrl) {
    return () => openUrl(session.issueUrl);
  }
  if (session.nextActionLabel.includes('PR') && session.prUrl) {
    return () => openUrl(session.prUrl);
  }
  if (session.nextActionLabel.includes('Preview') && session.previewUrl) {
    return () => openUrl(session.previewUrl);
  }
  if (
    session.status === 'idea' ||
    session.status === 'issue-ready' ||
    session.status === 'issue-created' ||
    session.status === 'agent-instruction-ready' ||
    session.status === 'agent-working'
  ) {
    return () => navigateToGroup('create');
  }
  if (
    session.status === 'pr-detected' ||
    session.status === 'ci-checking' ||
    session.status === 'preview-ready' ||
    session.status === 'review-needed'
  ) {
    return () => navigateToGroup('watch');
  }
  if (session.status === 'phase-complete') {
    return () => navigateToGroup('run');
  }
  return null;
}

type DarakeCurrentWorkPanelProps = {
  session?: DarakeWorkSession | null;
};

export function DarakeCurrentWorkPanel({ session = loadCurrentWorkSession() }: DarakeCurrentWorkPanelProps) {
  const currentSession = session ?? loadCurrentWorkSession();
  if (!hasActiveWorkSession(currentSession)) return null;

  const onNext = resolveNextAction(currentSession);

  return (
    <section className="currentWork" aria-label="今の作業">
      <span className="currentWork__eyebrow">Phase 105 · 今の作業</span>
      <h3 className="currentWork__title">今の作業</h3>
      <div className="currentWork__appName">{currentSession.appName}</div>
      {currentSession.currentPhaseTitle ? <div className="currentWork__phase">{currentSession.currentPhaseTitle}</div> : null}

      <div className="currentWork__facts">
        {currentSession.issueNumber ? <div>Issue: #{currentSession.issueNumber}</div> : null}
        {currentSession.prNumber ? <div>PR: #{currentSession.prNumber}</div> : null}
        <div>Preview: {currentSession.previewUrl ? 'あり' : 'なし'}</div>
      </div>

      <div className="currentWork__next">
        <span>次にやること:</span>
        <strong>{currentSession.nextActionLabel}</strong>
      </div>

      <div className="currentWork__actions">
        {onNext ? (
          <button type="button" className="currentWork__primary" onClick={onNext}>
            次へ
          </button>
        ) : null}
        {currentSession.issueUrl ? (
          <button type="button" className="currentWork__secondary" onClick={() => openUrl(currentSession.issueUrl)}>
            Issueを開く
          </button>
        ) : null}
        {currentSession.prUrl ? (
          <button type="button" className="currentWork__secondary" onClick={() => openUrl(currentSession.prUrl)}>
            PRを開く
          </button>
        ) : null}
        {currentSession.previewUrl ? (
          <button type="button" className="currentWork__secondary" onClick={() => openUrl(currentSession.previewUrl)}>
            Previewを開く
          </button>
        ) : null}
      </div>
    </section>
  );
}
