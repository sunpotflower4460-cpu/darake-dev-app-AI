import { useEffect, useMemo, useState } from 'react';
import { loadBlueprintStock } from '../utils/darakeBlueprintStock';
import { loadCockpitMorningReports } from '../utils/darakeCockpitMorningReport';
import {
  buildEmptyGentleAppStartForm,
  loadGentleAppStartForm,
  saveGentleAppStartForm,
} from '../utils/gentleAppStartForm';
import { loadDarakeTaskQueue } from '../utils/darakeTaskQueue';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { requestDarakeHumanViewModeChange } from '../utils/darakeHumanViewMode';
import { loadOmakaseStartState } from '../utils/omakaseStartState';
import { runOmakaseStart } from '../utils/runOmakaseStart';
import { createCockpitSeedFromFirstStartForm } from '../utils/firstStartCockpitSeed';

type HumanAction = {
  label: string;
  tone: 'primary' | 'quiet';
};

type HumanState = {
  status: string;
  next: string;
  stop: string;
  action: HumanAction;
  hint?: string;
  needsHumanReview?: boolean;
};

function simplifyOmakaseMessage(message?: string): string {
  if (!message) return '設定か入力内容の確認が必要です。';
  if (message.includes('GITHUB_TOKEN')) {
    return 'GitHub連携用の設定が足りません。CloudflareのSecret設定だけ確認してください。';
  }
  if (message.includes('GITHUB_ISSUE_CREATE_ENABLED')) {
    return 'Issue作成がまだ有効化されていません。Cloudflareの有効化設定だけ確認してください。';
  }
  if (message.includes('リポジトリ')) {
    return '使うリポジトリの指定だけ確認してください。';
  }
  if (message.includes('フォーム') || message.includes('アプリ情報')) {
    return 'アプリ名か一行説明が足りません。種の内容だけ確認してください。';
  }
  if (message.includes('ネットワーク')) {
    return '通信に失敗しました。少し後でもう一度試せます。';
  }
  return message.length > 78 ? `${message.slice(0, 78)}…` : message;
}

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
  omakaseNextAction?: string;
}): HumanState {
  if (args.isStarting || args.omakaseStatus === 'preparing') {
    return {
      status: 'AIに渡す準備をしています。',
      next: '設計図、MVPタスク、Issue作成、Cloud Agentへの橋渡しまで進めています。',
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
      next: '自動割り当てだけ未完了です。必要なら手動用の文面を開けます。',
      stop: 'なし',
      action: { label: '手動用を開く', tone: 'primary' },
      hint: '人間が読む必要があるのはここまでです。長いCloud Agent文は詳細側に置いてあります。',
      needsHumanReview: true,
    };
  }

  if (args.omakaseStatus === 'blocked' || args.omakaseStatus === 'failed') {
    const simplified = simplifyOmakaseMessage(args.omakaseMessage);
    return {
      status: 'ここだけ確認が必要です。',
      next: simplified,
      stop: args.omakaseNextAction || '確認あり',
      action: { label: args.omakaseStatus === 'failed' ? 'もう一度試す' : '確認する', tone: 'primary' },
      hint: '詳細パネルを読まなくても大丈夫です。必要な確認だけをここに短く出しています。',
      needsHumanReview: true,
    };
  }

  if (args.blockedHard > 0) {
    return {
      status: '止めるべき判断があります。',
      next: 'AIが勝手に進めない場所だけ、後で確認します。',
      stop: `${args.blockedHard}件`,
      action: { label: '後で確認する', tone: 'primary' },
      hint: '課金・法律・公開・secretなどの判断だけ、人間に戻します。',
      needsHumanReview: true,
    };
  }

  if (!args.hasSeed) {
    return {
      status: 'まだ種が置かれていません。',
      next: '下の2つだけ書けば、AIが設計図とMVPタスクに変換して、そのまま進めます。',
      stop: 'なし',
      action: { label: '種を置いて進める', tone: 'primary' },
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
      hint: 'AIが進められる部分は止めず、確認だけ後回しにします。',
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
  const [seedAppName, setSeedAppName] = useState('');
  const [seedIdea, setSeedIdea] = useState('');
  const [seedError, setSeedError] = useState<string | null>(null);

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

  useEffect(() => {
    if (hasSeed) return;
    setSeedAppName((current) => current || form?.appName || '');
    setSeedIdea((current) => current || form?.oneLineIdea || '');
  }, [form?.appName, form?.oneLineIdea, hasSeed]);

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
    omakaseNextAction: omakase?.nextActionLabel,
  });

  function saveSeedFromOnePage(): boolean {
    const appNameValue = seedAppName.trim();
    const ideaValue = seedIdea.trim();
    if (!appNameValue || !ideaValue) {
      setSeedError('アプリ名と一行アイデアだけ入れてください。');
      return false;
    }

    const nextForm = {
      ...(form ?? buildEmptyGentleAppStartForm()),
      appName: appNameValue,
      oneLineIdea: ideaValue,
      autoPreference: form?.autoPreference ?? 'maximum-darake',
    };

    saveGentleAppStartForm(nextForm);
    createCockpitSeedFromFirstStartForm(nextForm);
    setSeedError(null);
    setRevision((v) => v + 1);
    return true;
  }

  async function runSafeStartFlow() {
    setIsStarting(true);
    try {
      await runOmakaseStart();
    } finally {
      setIsStarting(false);
      setRevision((v) => v + 1);
    }
  }

  async function handlePrimaryAction() {
    if (isStarting) return;

    if (!hasSeed) {
      const saved = saveSeedFromOnePage();
      if (!saved) return;
      await runSafeStartFlow();
      return;
    }

    if (blockedHard > 0 || askLater > 0 || reports.length > 0 || omakase?.status === 'cloud-agent-ready') {
      requestDarakeHumanViewModeChange('details');
      return;
    }

    if (omakase?.status === 'blocked') {
      requestDarakeHumanViewModeChange('details');
      return;
    }

    if (omakase?.status === 'failed') {
      await runSafeStartFlow();
      return;
    }

    if (omakase?.status === 'assigned-to-agent' || omakase?.status === 'preparing') {
      return;
    }

    await runSafeStartFlow();
  }

  const primaryDisabled = isStarting || omakase?.status === 'assigned-to-agent' || omakase?.status === 'preparing';

  return (
    <main className="darakeHumanOnePage" aria-label="だらけdev app 人間用1ページ">
      <section className="darakeHumanOnePage__card">
        <div className="darakeHumanOnePage__eyebrow">だらけdev app</div>
        <h1 className="darakeHumanOnePage__title">{appName}</h1>
        <p className="darakeHumanOnePage__idea">{idea}</p>

        {!hasSeed && (
          <div className="darakeHumanOnePage__seedForm" aria-label="アプリの種">
            <label className="darakeHumanOnePage__field">
              <span>アプリ名</span>
              <input
                value={seedAppName}
                onChange={(e) => setSeedAppName(e.target.value)}
                placeholder="例: 宝地図アプリ"
              />
            </label>
            <label className="darakeHumanOnePage__field">
              <span>どんなアプリ？</span>
              <textarea
                value={seedIdea}
                onChange={(e) => setSeedIdea(e.target.value)}
                placeholder="例: 自分の夢や目標を宝の地図みたいに置いて、AIが次の一歩にしてくれるアプリ"
                rows={3}
              />
            </label>
            {seedError && <div className="darakeHumanOnePage__seedError">{seedError}</div>}
          </div>
        )}

        <div className="darakeHumanOnePage__statusBlock">
          <span className="darakeHumanOnePage__label">今の状態</span>
          <strong>{state.status}</strong>
        </div>

        <div className="darakeHumanOnePage__statusBlock">
          <span className="darakeHumanOnePage__label">AIが次に進めること</span>
          <strong>{state.next}</strong>
        </div>

        <div className={`darakeHumanOnePage__stop ${blockedHard > 0 || state.needsHumanReview || omakase?.status === 'blocked' || omakase?.status === 'failed' ? 'darakeHumanOnePage__stop--danger' : ''}`}>
          <span className="darakeHumanOnePage__label">止まっていること</span>
          <strong>{state.stop}</strong>
        </div>

        {state.hint && (
          <div className="darakeHumanOnePage__hint">
            {state.hint}
          </div>
        )}

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
