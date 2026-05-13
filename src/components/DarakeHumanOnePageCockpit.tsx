import { useEffect, useMemo, useState } from 'react';
import { loadBlueprintStock } from '../utils/darakeBlueprintStock';
import { loadCockpitMorningReports } from '../utils/darakeCockpitMorningReport';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';
import { loadDarakeTaskQueue } from '../utils/darakeTaskQueue';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { requestDarakeHumanViewModeChange } from '../utils/darakeHumanViewMode';

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
}): { status: string; next: string; stop: string; action: HumanAction } {
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

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  const form = useMemo(() => loadGentleAppStartForm(), [revision]);
  const blueprints = useMemo(() => loadBlueprintStock(), [revision]);
  const tasks = useMemo(() => loadDarakeTaskQueue(), [revision]);
  const reports = useMemo(() => loadCockpitMorningReports(), [revision]);

  const latestBlueprint = blueprints[blueprints.length - 1] ?? null;
  const appName = form?.appName?.trim() || latestBlueprint?.appName || 'まだ名前のないアプリ';
  const idea = form?.oneLineIdea?.trim() || latestBlueprint?.oneLineIdea || '作りたいものを置くと、AIがMVPまでの流れに変換します。';

  const queued = tasks.filter((task) => task.status === 'queued' || task.status === 'running' || task.status === 'retrying').length;
  const askLater = tasks.filter((task) => task.status === 'ask-later' || task.status === 'failed-soft').length;
  const blockedHard = tasks.filter((task) => task.status === 'blocked-hard').length;
  const done = tasks.filter((task) => task.status === 'done').length;

  const state = buildActionState({
    hasSeed: Boolean(latestBlueprint || tasks.length > 0 || form?.oneLineIdea?.trim()),
    queued,
    askLater,
    blockedHard,
    done,
    hasReport: reports.length > 0,
  });

  function handlePrimaryAction() {
    if (!latestBlueprint && tasks.length === 0) {
      requestDarakeHumanViewModeChange('details');
      return;
    }
    if (blockedHard > 0 || askLater > 0 || reports.length > 0) {
      requestDarakeHumanViewModeChange('details');
      return;
    }
    requestDarakeHumanViewModeChange('details');
  }

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

        <div className={`darakeHumanOnePage__stop ${blockedHard > 0 ? 'darakeHumanOnePage__stop--danger' : ''}`}>
          <span className="darakeHumanOnePage__label">止まっていること</span>
          <strong>{state.stop}</strong>
        </div>

        <button type="button" className="darakeHumanOnePage__primary" onClick={handlePrimaryAction}>
          {state.action.label}
        </button>

        <button type="button" className="darakeHumanOnePage__detail" onClick={() => requestDarakeHumanViewModeChange('details')}>
          詳細
        </button>
      </section>
    </main>
  );
}
