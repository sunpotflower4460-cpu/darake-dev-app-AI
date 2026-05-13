import { useEffect, useMemo, useState } from 'react';
import { loadBlueprintStock } from '../utils/darakeBlueprintStock';
import { loadCockpitMorningReports } from '../utils/darakeCockpitMorningReport';
import {
  buildEmptyGentleAppStartForm,
  loadGentleAppStartForm,
  saveGentleAppStartForm,
} from '../utils/gentleAppStartForm';
import {
  buildEmptyGitHubStartSettings,
  loadGitHubStartSettings,
  saveGitHubStartSettings,
} from '../utils/githubStartSettings';
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

type ReceiptTone = 'done' | 'working' | 'review' | 'idle';

type ReceiptItem = {
  label: string;
  value: string;
  done: boolean;
};

const TEST_SEED_TEMPLATE = {
  appName: '宝地図アプリ',
  oneLineIdea: '自分の夢や目標を宝の地図みたいに置いて、AIが次の一歩にしてくれるアプリ',
};

const DEFAULT_TEST_REPO_URL = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI';

function isRepositoryCheckNeeded(message?: string, nextAction?: string): boolean {
  const text = `${message ?? ''} ${nextAction ?? ''}`;
  return text.includes('リポジトリ') || text.includes('repo') || text.includes('repository');
}

function isValidGitHubRepoUrl(value: string): boolean {
  return /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/.test(value.trim());
}

function simplifyOmakaseMessage(message?: string): string {
  if (!message) return '設定か入力内容の確認が必要です。';
  if (message.includes('GITHUB_TOKEN')) {
    return 'GitHub連携用の設定が足りません。CloudflareのSecret設定だけ確認してください。';
  }
  if (message.includes('GITHUB_ISSUE_CREATE_ENABLED')) {
    return 'Issue作成がまだ有効化されていません。Cloudflareの有効化設定だけ確認してください。';
  }
  if (message.includes('リポジトリ')) {
    return 'AIが作業を書く場所だけ確認してください。下のボタンか入力欄で進めます。';
  }
  if (message.includes('フォーム') || message.includes('アプリ情報')) {
    return 'アプリ名か一行説明が足りません。種の内容だけ確認してください。';
  }
  if (message.includes('ネットワーク')) {
    return '通信に失敗しました。少し後でもう一度試せます。';
  }
  return message.length > 78 ? `${message.slice(0, 78)}…` : message;
}

function buildReceipt(args: {
  hasSeed: boolean;
  blueprintCount: number;
  taskCount: number;
  issueNumber?: number;
  omakaseStatus?: string;
  isStarting: boolean;
}): { title: string; message: string; tone: ReceiptTone; items: ReceiptItem[] } {
  const hasBlueprint = args.blueprintCount > 0;
  const hasTasks = args.taskCount > 0;
  const hasIssue = Boolean(args.issueNumber);
  const agentWorking = args.omakaseStatus === 'assigned-to-agent';
  const fallbackReady = args.omakaseStatus === 'cloud-agent-ready';
  const blocked = args.omakaseStatus === 'blocked' || args.omakaseStatus === 'failed';

  const items: ReceiptItem[] = [
    { label: '入力', value: args.hasSeed ? 'OK' : '未入力', done: args.hasSeed },
    { label: '設計図', value: hasBlueprint ? '作成済み' : 'まだ', done: hasBlueprint },
    { label: 'やること', value: hasTasks ? '作成済み' : 'まだ', done: hasTasks },
    { label: '作業場所', value: hasIssue ? `#${args.issueNumber}` : 'まだ', done: hasIssue },
    {
      label: 'AI',
      value: agentWorking ? '作業中' : fallbackReady ? '確認あり' : blocked ? '確認あり' : '待機中',
      done: agentWorking,
    },
  ];

  if (args.isStarting || args.omakaseStatus === 'preparing') {
    return {
      title: '進めています',
      message: '設計図から作業場所の作成まで、できるところを処理しています。',
      tone: 'working',
      items,
    };
  }

  if (agentWorking) {
    return {
      title: 'できました',
      message: 'AIが作業を始めました。今は何もしなくてOKです。',
      tone: 'done',
      items,
    };
  }

  if (fallbackReady) {
    return {
      title: 'ほぼできました',
      message: '作業場所は作れました。AIへの自動割り当てだけ確認できます。',
      tone: 'review',
      items,
    };
  }

  if (blocked) {
    return {
      title: 'あと1つだけ確認',
      message: '進める前に、短い確認が1つあります。',
      tone: 'review',
      items,
    };
  }

  if (hasBlueprint && hasTasks) {
    return {
      title: '準備できました',
      message: '設計図とやることはできています。次に作業場所を作ります。',
      tone: 'done',
      items,
    };
  }

  return {
    title: args.hasSeed ? '入力できました' : 'まだ始めていません',
    message: args.hasSeed ? 'AIが設計図に変換する準備をしています。' : 'アプリ名と一行アイデアだけで始められます。',
    tone: 'idle',
    items,
  };
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
  repoCheckNeeded?: boolean;
}): HumanState {
  if (args.isStarting || args.omakaseStatus === 'preparing') {
    return {
      status: 'AIに渡す準備をしています。',
      next: '設計図、やること、作業場所の作成まで進めています。',
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
      status: '作業場所は作れました。',
      next: '自動割り当てだけ未完了です。必要なら手動用の文面を開けます。',
      stop: 'なし',
      action: { label: '手動用を開く', tone: 'primary' },
      hint: '長いCloud Agent文は「詳しく見る」の中に置いてあります。',
      needsHumanReview: true,
    };
  }

  if (args.repoCheckNeeded) {
    return {
      status: 'あと1つだけ確認します。',
      next: 'AIが作業を書くGitHubの場所を選ぶだけです。テストなら「このリポジトリで進める」でOKです。',
      stop: '作業場所',
      action: { label: '入力したURLで進める', tone: 'primary' },
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
      hint: '細かい内部ログは読まなくて大丈夫です。必要な確認だけをここに短く出しています。',
      needsHumanReview: true,
    };
  }

  if (args.blockedHard > 0) {
    return {
      status: '止めるべき判断があります。',
      next: '課金・法律・公開・secretなど、AIが勝手に進めない場所だけ後で確認します。',
      stop: `${args.blockedHard}件`,
      action: { label: '後で確認する', tone: 'primary' },
      hint: '安全に関わる判断だけ、人間に戻します。',
      needsHumanReview: true,
    };
  }

  if (!args.hasSeed) {
    return {
      status: 'まずは作りたいものを1つ置きます。',
      next: 'テストなら「すぐ試す」、自分のアプリなら2つの欄を書いて開始します。',
      stop: 'なし',
      action: { label: 'この内容でAIに任せる', tone: 'primary' },
    };
  }

  if (args.queued > 0) {
    return {
      status: '設計図とやることを作りました。',
      next: 'AIが進められる範囲で、作業場所の作成と実装準備へ進めます。',
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
      status: '進捗メモがあります。',
      next: '進んだことだけ短く確認できます。',
      stop: 'なし',
      action: { label: '進捗を見る', tone: 'primary' },
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
  const [repoUrl, setRepoUrl] = useState('');
  const [repoError, setRepoError] = useState<string | null>(null);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const form = useMemo(() => loadGentleAppStartForm(), [revision]);
  const githubSettings = useMemo(() => loadGitHubStartSettings(), [revision]);
  const blueprints = useMemo(() => loadBlueprintStock(), [revision]);
  const tasks = useMemo(() => loadDarakeTaskQueue(), [revision]);
  const reports = useMemo(() => loadCockpitMorningReports(), [revision]);
  const omakase = useMemo(() => loadOmakaseStartState(), [revision, isStarting]);

  const latestBlueprint = blueprints[blueprints.length - 1] ?? null;
  const appName = form?.appName?.trim() || latestBlueprint?.appName || '何を作りますか？';
  const idea = form?.oneLineIdea?.trim() || latestBlueprint?.oneLineIdea || 'すぐ試すか、アプリ名と一行アイデアを書くだけで始められます。';

  const queued = tasks.filter((task) => task.status === 'queued' || task.status === 'running' || task.status === 'retrying').length;
  const askLater = tasks.filter((task) => task.status === 'ask-later' || task.status === 'failed-soft').length;
  const blockedHard = tasks.filter((task) => task.status === 'blocked-hard').length;
  const done = tasks.filter((task) => task.status === 'done').length;

  const hasSeed = Boolean(latestBlueprint || tasks.length > 0 || form?.oneLineIdea?.trim());
  const repoCheckNeeded = isRepositoryCheckNeeded(omakase?.userMessage, omakase?.nextActionLabel);
  const showReceipt = hasSeed || isStarting || Boolean(omakase?.status);
  const showProgressCards = hasSeed || isStarting || Boolean(omakase?.status) || blockedHard > 0 || askLater > 0;
  const showDetailsButton = hasSeed && !repoCheckNeeded && (blockedHard > 0 || askLater > 0 || reports.length > 0 || Boolean(omakase?.status));

  useEffect(() => {
    if (hasSeed) return;
    setSeedAppName((current) => current || form?.appName || '');
    setSeedIdea((current) => current || form?.oneLineIdea || '');
  }, [form?.appName, form?.oneLineIdea, hasSeed]);

  useEffect(() => {
    setRepoUrl((current) => current || githubSettings?.repoUrl || '');
  }, [githubSettings?.repoUrl]);

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
    repoCheckNeeded,
  });

  const receipt = buildReceipt({
    hasSeed,
    blueprintCount: blueprints.length,
    taskCount: tasks.length,
    issueNumber: omakase?.issueNumber,
    omakaseStatus: omakase?.status,
    isStarting,
  });

  function saveSeedValues(appNameValue: string, ideaValue: string): boolean {
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

  function saveSeedFromOnePage(): boolean {
    return saveSeedValues(seedAppName.trim(), seedIdea.trim());
  }

  function saveRepositoryValue(value: string): boolean {
    const trimmed = value.trim();
    if (!isValidGitHubRepoUrl(trimmed)) {
      setRepoError('GitHubのURLを入れてください。例: https://github.com/user/repo');
      return false;
    }

    saveGitHubStartSettings({
      ...(githubSettings ?? buildEmptyGitHubStartSettings()),
      repoUrl: trimmed.replace(/\/$/, ''),
      mode: githubSettings?.mode ?? 'open-issue-page',
      updatedAt: new Date().toISOString(),
    });
    setRepoError(null);
    setRevision((v) => v + 1);
    return true;
  }

  function saveRepositoryUrl(): boolean {
    return saveRepositoryValue(repoUrl);
  }

  async function saveRepositoryAndRetry() {
    if (isStarting) return;
    const saved = saveRepositoryUrl();
    if (!saved) return;
    await runSafeStartFlow();
  }

  async function useDefaultRepositoryAndRetry() {
    if (isStarting) return;
    setRepoUrl(DEFAULT_TEST_REPO_URL);
    const saved = saveRepositoryValue(DEFAULT_TEST_REPO_URL);
    if (!saved) return;
    await runSafeStartFlow();
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

  async function runSampleStartFlow() {
    if (isStarting) return;
    setSeedAppName(TEST_SEED_TEMPLATE.appName);
    setSeedIdea(TEST_SEED_TEMPLATE.oneLineIdea);
    const saved = saveSeedValues(TEST_SEED_TEMPLATE.appName, TEST_SEED_TEMPLATE.oneLineIdea);
    if (!saved) return;
    await runSafeStartFlow();
  }

  async function handlePrimaryAction() {
    if (isStarting) return;

    if (repoCheckNeeded) {
      await saveRepositoryAndRetry();
      return;
    }

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
            <div className="darakeHumanOnePage__seedGuide">
              <strong>すぐ試す</strong>
              <span>まず動くか見るだけなら、このボタンで最後まで流せます。</span>
            </div>
            <button
              type="button"
              className="darakeHumanOnePage__templateButton darakeHumanOnePage__templateButton--primary"
              onClick={runSampleStartFlow}
              disabled={primaryDisabled}
            >
              サンプルで一気に試す
            </button>
            <div className="darakeHumanOnePage__seedDivider">自分のアプリで始める場合</div>
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

        {showReceipt && (
          <div className={`darakeHumanOnePage__receipt darakeHumanOnePage__receipt--${receipt.tone}`}>
            <div>
              <span className="darakeHumanOnePage__label">進み具合</span>
              <strong>{receipt.title}</strong>
              <p>{receipt.message}</p>
            </div>
            <div className="darakeHumanOnePage__receiptList">
              {receipt.items.map((item) => (
                <div className="darakeHumanOnePage__receiptItem" key={item.label}>
                  <span>{item.done ? '✓' : '・'}</span>
                  <b>{item.label}</b>
                  <em>{item.value}</em>
                </div>
              ))}
            </div>
          </div>
        )}

        {showProgressCards && (
          <>
            <div className="darakeHumanOnePage__statusBlock">
              <span className="darakeHumanOnePage__label">今の状態</span>
              <strong>{state.status}</strong>
            </div>

            <div className="darakeHumanOnePage__statusBlock">
              <span className="darakeHumanOnePage__label">次に起きること</span>
              <strong>{state.next}</strong>
            </div>

            <div className={`darakeHumanOnePage__stop ${blockedHard > 0 || state.needsHumanReview || omakase?.status === 'blocked' || omakase?.status === 'failed' ? 'darakeHumanOnePage__stop--danger' : ''}`}>
              <span className="darakeHumanOnePage__label">確認が必要なこと</span>
              <strong>{state.stop}</strong>
            </div>
          </>
        )}

        {repoCheckNeeded && (
          <div className="darakeHumanOnePage__repoFix" aria-label="作業場所の確認">
            <div className="darakeHumanOnePage__repoFixHeader">
              <strong>AIが作業を書く場所</strong>
              <span>テストなら、このまま下のボタンを押すだけで進められます。</span>
            </div>
            <button
              type="button"
              className="darakeHumanOnePage__templateButton darakeHumanOnePage__templateButton--primary"
              onClick={useDefaultRepositoryAndRetry}
              disabled={primaryDisabled}
            >
              このリポジトリで進める
            </button>
            <div className="darakeHumanOnePage__seedDivider">別のGitHubリポジトリを使う場合</div>
            <label className="darakeHumanOnePage__field">
              <span>GitHubのURL</span>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
              />
            </label>
            {repoError && <div className="darakeHumanOnePage__seedError">{repoError}</div>}
          </div>
        )}

        {state.hint && !repoCheckNeeded && (
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

        {showDetailsButton && (
          <button type="button" className="darakeHumanOnePage__detail" onClick={() => requestDarakeHumanViewModeChange('details')}>
            詳しく見る
          </button>
        )}
      </section>
    </main>
  );
}
