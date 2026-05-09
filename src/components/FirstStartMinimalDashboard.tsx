import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { decideCardVisibility } from '../utils/cardVisibilityPolicy';
import { loadDarakeAutopilotState } from '../utils/darakeAutopilotState';
import { loadOmakaseStartState } from '../utils/omakaseStartState';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function FirstStartMinimalDashboard() {
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const autopilot = useMemo(() => loadDarakeAutopilotState(), [revision]);
  const omakase = useMemo(() => loadOmakaseStartState(), [revision]);

  const isBlocked =
    autopilot?.status === 'blocked' ||
    autopilot?.status === 'needs-human' ||
    autopilot?.status === 'failed';

  const isMergeCandidate = autopilot?.status === 'merge-candidate';

  const isWorking =
    autopilot &&
    !isBlocked &&
    !isMergeCandidate &&
    autopilot.status !== 'off' &&
    autopilot.status !== 'idle';

  const isOmakaseReady =
    !autopilot?.enabled ||
    autopilot?.status === 'idle' ||
    autopilot?.status === 'off';

  const isNothingToDo =
    !!isWorking ||
    (autopilot?.status === 'done');

  const isSetupNeeded =
    !autopilot && !omakase;

  const decision = decideCardVisibility({
    hasWakeAction: false,
    isBlocked,
    isMergeCandidate,
    isOmakaseReady: !!(isOmakaseReady && !isBlocked && !isMergeCandidate),
    isNothingToDo: !!(isNothingToDo && !isBlocked && !isMergeCandidate),
    isSetupNeeded: !!(isSetupNeeded && !isBlocked && !isMergeCandidate),
  });

  return (
    <div className="firstStartMinimalDashboard">
      {decision.cards.map((kind) => {
        if (kind === 'blocked') {
          return (
            <div key={kind} className="firstStartMinimalCard firstStartMinimalCard--blocked">
              <div className="firstStartMinimalCard__status">止まりました</div>
              <div className="firstStartMinimalCard__title">確認が必要です</div>
              {autopilot?.wakeReason && (
                <div className="firstStartMinimalCard__reason">理由：{autopilot.wakeReason}</div>
              )}
              <div className="firstStartMinimalCard__next">
                次にやること：{autopilot?.nextActionLabel ?? '確認してください'}
              </div>
            </div>
          );
        }

        if (kind === 'merge-candidate') {
          return (
            <div key={kind} className="firstStartMinimalCard firstStartMinimalCard--merge">
              <div className="firstStartMinimalCard__status">マージ候補</div>
              <div className="firstStartMinimalCard__title">マージ候補です</div>
              <div className="firstStartMinimalCard__sub">PRは問題なさそうです。</div>
              <div className="firstStartMinimalCard__next">
                次にやること：PRを開いて確認してください
              </div>
              {autopilot?.prUrl && (
                <a
                  href={autopilot.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="firstStartMinimalCard__btn"
                >
                  <ExternalLink size={14} style={{ marginRight: 4 }} /> PRを開く
                </a>
              )}
            </div>
          );
        }

        if (kind === 'nothing-to-do') {
          return (
            <div key={kind} className="firstStartMinimalCard firstStartMinimalCard--nothing">
              <div className="firstStartMinimalCard__status">作業中</div>
              <div className="firstStartMinimalCard__title">何もしなくてOK</div>
              <div className="firstStartMinimalCard__sub">AIが作業中です。止まった時だけ知らせます。</div>
            </div>
          );
        }

        if (kind === 'omakase-start') {
          return (
            <div key={kind} className="firstStartMinimalCard firstStartMinimalCard--action">
              <div className="firstStartMinimalCard__status">準備できています</div>
              <div className="firstStartMinimalCard__title">この内容で作り始める</div>
              <div className="firstStartMinimalCard__next">
                次にやること：フォームを確認して「おまかせ開始」を押してください
              </div>
            </div>
          );
        }

        if (kind === 'setup-needed') {
          return (
            <div key={kind} className="firstStartMinimalCard firstStartMinimalCard--setup">
              <div className="firstStartMinimalCard__status">設定が必要</div>
              <div className="firstStartMinimalCard__title">最初だけ設定が必要です</div>
              <div className="firstStartMinimalCard__sub">
                Cloudflare / GitHubの設定を確認してください
              </div>
            </div>
          );
        }

        // 'details' fallback
        return (
          <div key={kind} className="firstStartMinimalCard">
            <div className="firstStartMinimalCard__title">準備できています</div>
            <div className="firstStartMinimalCard__sub">フォームに入力して作り始めてください。</div>
          </div>
        );
      })}
    </div>
  );
}
