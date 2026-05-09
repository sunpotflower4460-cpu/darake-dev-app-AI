import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  loadTestRunState,
  saveTestRunState,
  resetTestRunState,
  TREASURE_MAP_PRESET,
} from '../utils/testRunState';
import { saveGentleAppStartForm, buildEmptyGentleAppStartForm } from '../utils/gentleAppStartForm';
import { loadGitHubIssueCreateState } from '../utils/githubIssueCreateState';

const STATUS_CLASS: Record<string, string> = {
  idle: '',
  ready: 'darakeTestRunPanel__status--running',
  'issue-created': 'darakeTestRunPanel__status--running',
  'agent-started': 'darakeTestRunPanel__status--running',
  'pr-waiting': 'darakeTestRunPanel__status--running',
  'pr-found': 'darakeTestRunPanel__status--running',
  'checks-running': 'darakeTestRunPanel__status--running',
  'fix-loop-tested': 'darakeTestRunPanel__status--running',
  'merge-candidate': 'darakeTestRunPanel__status--done',
  done: 'darakeTestRunPanel__status--done',
  failed: 'darakeTestRunPanel__status--failed',
};

export function DarakeTestRunPanel() {
  const [state, setState] = useState(loadTestRunState);

  function handleStart() {
    const repoUrl = loadGitHubIssueCreateState()?.repoUrl ?? '';

    if (!repoUrl) {
      const s = saveTestRunState({
        status: 'failed',
        appName: TREASURE_MAP_PRESET.appName,
        repoUrl: '',
        userMessage: 'GitHubリポジトリURLが設定されていません',
        nextActionLabel: '設定を確認してください',
      });
      setState(s);
      return;
    }

    // Apply preset to form
    const base = buildEmptyGentleAppStartForm();
    saveGentleAppStartForm({
      ...base,
      appName: TREASURE_MAP_PRESET.appName,
      oneLineIdea: TREASURE_MAP_PRESET.oneLineIdea,
      targetUser: TREASURE_MAP_PRESET.targetUser,
      platform: TREASURE_MAP_PRESET.platform,
      mainFeeling: TREASURE_MAP_PRESET.mainFeeling,
      firstGoal: TREASURE_MAP_PRESET.firstGoal,
      mustHave: 'メモ入力 / 宝地図カード生成(モック) / タイトル自動生成(モック) / ボード表示 / カードをボードに貼るUI / ローカル保存 / README / typecheck/build',
      mustNotDo: 'AI APIは呼ばない。画像生成はモックのみ。外部サービスへの接続なし。',
      notes: 'UIは宝地図ボード。雰囲気：明るい・幻想的・やさしい・夢が叶いそう。スマホで見やすい。',
    });

    const s = saveTestRunState({
      status: 'ready',
      appName: TREASURE_MAP_PRESET.appName,
      repoUrl,
      userMessage: 'フォームにプリセットを反映しました。Autopilotで作業を開始します。',
      nextActionLabel: 'Autopilotパネルで「作り始める」を押してください',
    });
    setState(s);
  }

  function handleReset() {
    resetTestRunState();
    setState(null);
  }

  const isFailed = state?.status === 'failed';
  const statusClass = state ? (STATUS_CLASS[state.status] ?? '') : '';

  return (
    <div className="darakeTestRunPanel">
      <div className="darakeTestRunPanel__title">実際に1回流してみる</div>
      <div className="darakeTestRunPanel__subtitle">
        宝地図メモ帳を使って、だらけ管制室の流れを確認します。
      </div>

      <div className="darakeTestRunPanel__preset">
        <dl>
          <dt>アプリ名</dt>
          <dd>{TREASURE_MAP_PRESET.appName}</dd>
          <dt>内容</dt>
          <dd>{TREASURE_MAP_PRESET.oneLineIdea}</dd>
          <dt>対象</dt>
          <dd>{TREASURE_MAP_PRESET.targetUser}</dd>
          <dt>UIテンプレート</dt>
          <dd>{TREASURE_MAP_PRESET.uiTemplate}</dd>
        </dl>
      </div>

      {(!state || state.status === 'idle') && (
        <button type="button" className="darakeTestRunPanel__btn" onClick={handleStart}>
          宝地図メモ帳でテスト開始
        </button>
      )}

      {state && state.status !== 'idle' && (
        <div className={`darakeTestRunPanel__status ${statusClass}`}>
          <div className="darakeTestRunPanel__statusTitle">
            {isFailed ? '止まりました' : state.status === 'done' || state.status === 'merge-candidate' ? '完了' : 'AIが作業中です'}
          </div>
          <div>{state.userMessage}</div>
          {isFailed && (
            <div className="darakeTestRunPanel__next">
              次にやること：{state.nextActionLabel}
            </div>
          )}
          {!isFailed && (
            <div className="darakeTestRunPanel__next">
              今やること：{state.nextActionLabel}
            </div>
          )}
          {state.issueUrl && (
            <a href={state.issueUrl} target="_blank" rel="noopener noreferrer" className="darakeTestRunPanel__link">
              <ExternalLink size={13} /> Issueを開く
            </a>
          )}
          {state.prUrl && (
            <a href={state.prUrl} target="_blank" rel="noopener noreferrer" className="darakeTestRunPanel__link" style={{ marginLeft: 8 }}>
              <ExternalLink size={13} /> PRを開く
            </a>
          )}
          <div style={{ marginTop: 10 }}>
            <button type="button" className="darakeTestRunPanel__btnReset" onClick={handleReset}>
              リセット
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
