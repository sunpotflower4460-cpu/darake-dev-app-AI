import { useEffect, useMemo, useState } from 'react';
import { computeGitHubStartProgress } from '../utils/githubStartProgress';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

export function GitHubStartProgressPanel() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const progress = useMemo(() => computeGitHubStartProgress(), [revision]);

  const issueRecorded = progress === 'issue-recorded' || progress === 'cloud-agent-ready';

  return (
    <div className="gspPanel">
      <div className="gspLabel">いまここ</div>

      {issueRecorded ? (
        <div className="gspCard">
          <div className="gspStep gspDone">✅ アプリ内容を入力しました</div>
          <div className="gspStep gspDone">✅ Issueを作成しました</div>
          <div className="gspStep gspDone">✅ Cloud Agent指示を作れます</div>
          <div className="gspNextBox">
            <div className="gspNextLabel">次にやること：</div>
            <div className="gspNextDetail">
              Cloud Agentに貼る指示をコピーして、Cloud Agentのチャットへ貼ってください。
            </div>
          </div>
        </div>
      ) : (
        <div className="gspCard">
          <div className="gspStep gspDone">✅ アプリ内容を入力しました</div>
          <div className="gspStep gspDone">✅ GitHub Issue下書きを作れます</div>
          <div className="gspStep gspPending">⬜ Issueを作成</div>
          <div className="gspStep gspPending">⬜ Cloud Agentに貼る</div>
        </div>
      )}
    </div>
  );
}
