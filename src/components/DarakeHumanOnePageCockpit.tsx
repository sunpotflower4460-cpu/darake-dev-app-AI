import { useEffect, useMemo, useState } from 'react';
import { loadBlueprintStock } from '../utils/darakeBlueprintStock';
import { loadCockpitMorningReports } from '../utils/darakeCockpitMorningReport';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';
import { loadDarakeTaskQueue } from '../utils/darakeTaskQueue';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { requestDarakeHumanViewModeChange } from '../utils/darakeHumanViewMode';
import { loadOmakaseStartState } from '../utils/omakaseStartState';
import { runOmakaseStart } from '../utils/runOmakaseStart';

type HumanAction = {
  label: string;
  tone: 'primary' | 'quiet';
};

function buildActionState(args: {
  hasSeed: boolean;
  queued: number;
  askLater: number;
  blockedHard: number;
  done: number;
  hasReport: boolean;
  isStarting: boolean;
  omakaseStatus?: string;
  omakaseMessage?: string;
}): { status: string; next: string; stop: string; action: HumanAction } {
  if (args.isStarting || args.omakaseStatus === 'preparing') {
    return {
      status: 'AIに渡す準備をしています。',
      next: 'Issue作成とCloud Agentへの橋渡しを進めています。',
      stop: 'なし',
      action: { label: '進めています', tone: 'quiet' },
    };
  }

  if (args.omakaseStatus === 'assigned-to-agent') {
    return {
      status: 'AIが作業中です。',
      next: '今は何もしなくて大丈夫です。進捗だけ裏で見ます。',
      stop: 'なし',
      action: { label: '何もしなくてOK', tone: 'quiet' },
    };
  }

  if (args.omakaseStatus === 'cloud-agent-ready') {
    return {
      status: 'Issueは作れました。',
      next: 'Cloud Agentへの自動割り当てだけ確認が必要です。',
      stop: 'なし',
      action: { label: '詳細で確認する', tone: 'primary' },
    };
  }

  if (args.omakaseStatus === 'blocked' || args.omakaseStatus === 'failed') {
    return {
      status: '進行が止まっています。',
      next: args.omakaseMessage || '設定か入力内容を確認してください。',
      stop: '確認あり',
      action: { label: '詳細で確認する', tone: 'primary' },
    };
  }

  if (args.blockedHard > 0) {
    return {
      status: '止めるべき判断があります。',
      next: 'AIが勝手に進めない場所だけ、後で確認します。',
      stop: `${args.blockedHard}件`,
      action: { label: '後で確認する', tone: 'primary' },
    };
  }

  if (!args.hasSeed) {
    return {
      status: 'まだ種が置かれていません。',
      next: '作りたいアプリを1つ置くと、AIが設計図とMVPタスクに変換します。',
      stop: 'なし',
      action: { label: '種を置く', tone: 'primary' },
    };
  }

  if (args.queued > 0) {
    return {
      status: '設計図とMVPタスクを作りました。',
      next: 'AIが進められる範囲で、MVP Issueと実装準備へ進めます。',
      stop: 'なし',
      action: { label: 'このまま進める', tone: 'primary' },
    };
  }

  if (args.askLater > 0) {
    return {
      status: '後で聞くことがあります。',
      next: '細かい確認はまとめて後で見られます。今すぐ読む必要はありません。',
      stop: 'なし',
      action: { label: '後で見る', tone: 'primary' },
    };
  }

  if (args.hasReport) {
    return {
      status: '朝レポートがあります。',
      next: '進んだことだけ短く確認できます。',
      stop: 'なし',
      action: { label: '朝レポートを見る', tone: 'primary' },
    };
  }

  if (args.done > 0) {
    return {
      status: '今やることはありません。',
      next: '次のアプリの種を置けます。',
      stop: 'なし',
      action: { label: '次の種を置く', tone: 'primary' },
    };
  }

  return {
    status: '準備中です。',
    next: 'AIが見える裏側の情報を整えています。',
    stop: 'なし',
    action: { label: 'このまま進める', tone: 'primary' },
  };
}

export function DarakeHumanOnePageCockpit() {
  const [revision, setRevision] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const form = useMemo(() => loadGentleAppStartForm(), [revision]);
  const blueprints = useMemo(() => loadBlueprintStock(), [revision]);
  const tasks = useMemo(() => loadDarakeTaskQueue(), [revision]);
  const reports = useMemo(() => loadCockpitMorningReports(), [revision]);
  const omakase = useMemo(() => loadOmakaseStartState(), [revision, isStarting]);

  const latestBlueprint = blueprints[blueprints.length - 1] ?? null;
  const appName = form?.appName?.trim() || latestBlueprint?.appName || 'まだ名前のないアプリ';
  const idea = form?.oneLineIdea?.trim() || latestBlueprint?.oneLineIdea || '作りたいものを置くと、AIがMVPまでの流れに変換します。';

  const queued = tasks.filter((task) => task.status === 'queued' || task.status === 'running' || task.status === 'retrying').length;
  const askLater = tasks.filter((task) => task.status === 'ask-later' || task.status === 'failed-soft').length;
  const blockedHard = tasks.filter((task) => task.status === 'blocked-hard').length;
  const done = tasks.filter((task) => task.status === 'done').length;

  const hasSeed = Boolean(latestBlueprint || tasks.length > 0 || form?.oneLineIdea?.trim());
  const state = buildActionState({
    hasSeed,
    queued,
    askLater,
    blockedHard,
    done,
    hasReport: reports.length > 0,
    isStarting,
    omakaseStatus: omakase?.status,
    omakaseMessage: omakase?.userMessage,
  });

  async function handlePrimaryAction() {
    if (isStarting) return;

    if (!hasSeed) {
      requestDarakeHumanViewModeChange('details');
      return;
    }

    if (
      blockedHard > 0 ||
      askLater > 0 ||
      reports.length > 0 ||
      omakase?.status === 'blocked' ||
      omakase?.status === 'failed' ||
      omakase?.status === 'cloud-agent-ready'
    ) {
      requestDarakeHumanViewModeChange('details');
      return;
    }

    if (omakase?.status === 'assigned-to-agent' || omakase?.status === 'preparing') {
      return;
    }

    setIsStarting(true);
    try {
      await runOmakaseStart();
    } finally {
      setIsStarting(false);
      setRevision((v) => v + 1);
    }
  }

  const primaryDisabled = isStarting || omakase?.status === 'assigned-to-agent' || omakase?.status === 'preparing';

  return (
    <main className="darakeHumanOnePage" aria-label="だらけdev app 人間用1ページ">
      <section className="darakeHumanOnePage__card">
        <div className="darakeHumanOnePage__eyebrow">だらけdev app</div>
        <h1 className="darakeHumanOnePage__title">{appName}</h1>
        <p className="darakeHumanOnePage__idea">{idea}</p>

        <div className="darakeHumanOnePage__statusBlock">
          <span className="darakeHumanOnePage__label">今の状態</span>
          <strong>{state.status}</strong>
        </div>

        <div className="darakeHumanOnePage__statusBlock">
          <span className="darakeHumanOnePage__label">AIが次に進めること</span>
          <strong>{state.next}</strong>
        </div>

        <div className={`darakeHumanOnePage__stop ${blockedHard > 0 || omakase?.status === 'blocked' || omakase?.status === 'failed' ? 'darakeHumanOnePage__stop--danger' : ''}`}>
          <span className="darakeHumanOnePage__label">止まっていること</span>
          <strong>{state.stop}</strong>
        </div>

        <button
          type="button"
          className="darakeHumanOnePage__primary"
          onClick={handlePrimaryAction}
          disabled={primaryDisabled}
        >
          {state.action.label}
        </button>

        <button type="button" className="darakeHumanOnePage__detail" onClick={() => requestDarakeHumanViewModeChange('details')}>
          詳細
        </button>
      </section>
    </main>
  );
}
