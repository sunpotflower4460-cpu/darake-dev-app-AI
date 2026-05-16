import { useState } from 'react';
import '../prCiHumanSummary.css';
import {
  buildMockPrCiSnapshot,
  translatePrCiToHuman,
  type CiStatus,
  type PrCiSnapshot,
} from '../utils/prCiHumanTranslator';
import { fetchPrCiRealData, type PrCiRealResult } from '../utils/prCiRealDataClient';

const LAST_QUERY_KEY = 'darake.prCiHuman.lastQuery.v1';

type LastQuery = { repoUrl: string; prNumber: string };

function loadLastQuery(): LastQuery {
  try {
    const raw = localStorage.getItem(LAST_QUERY_KEY);
    if (!raw) return { repoUrl: '', prNumber: '' };
    const parsed = JSON.parse(raw) as Partial<LastQuery>;
    return {
      repoUrl: typeof parsed.repoUrl === 'string' ? parsed.repoUrl : '',
      prNumber: typeof parsed.prNumber === 'string' ? parsed.prNumber : '',
    };
  } catch {
    return { repoUrl: '', prNumber: '' };
  }
}

function saveLastQuery(q: LastQuery) {
  try {
    localStorage.setItem(LAST_QUERY_KEY, JSON.stringify(q));
  } catch {
    // ignore
  }
}

function healthToSnapshot(health: string, prNumber: number): PrCiSnapshot {
  const lower = health.toLowerCase();
  const ciStatus: CiStatus =
    lower.includes('pass') || lower.includes('success') || lower.includes('green')
      ? 'passed'
      : lower.includes('fail') || lower.includes('red')
        ? 'failed'
        : lower.includes('run') || lower.includes('pending')
          ? 'running'
          : 'unknown';
  const mergeReadiness: PrCiSnapshot['mergeReadiness'] =
    lower.includes('merged') ? 'merged' : ciStatus === 'passed' ? 'ready' : 'not-ready';
  return buildMockPrCiSnapshot({ ciStatus, mergeReadiness, prNumber });
}

const DEMO_SCENARIOS: { label: string; snapshot: Partial<PrCiSnapshot> }[] = [
  { label: 'CI成功', snapshot: { ciStatus: 'passed', mergeReadiness: 'ready' } },
  { label: 'CI失敗', snapshot: { ciStatus: 'failed', mergeReadiness: 'not-ready' } },
  { label: 'CI実行中', snapshot: { ciStatus: 'running', mergeReadiness: 'not-ready' } },
  { label: '修正依頼', snapshot: { ciStatus: 'passed', reviewStatus: 'changes-requested', mergeReadiness: 'not-ready' } },
  { label: 'マージ済', snapshot: { ciStatus: 'passed', mergeReadiness: 'merged' } },
];

const CI_CHIP_CLASS: Record<CiStatus, string> = {
  passed: 'prCiHuman__chip--ci-passed',
  failed: 'prCiHuman__chip--ci-failed',
  running: 'prCiHuman__chip--ci-running',
  unknown: 'prCiHuman__chip--ci-unknown',
  skipped: 'prCiHuman__chip--ci-unknown',
};

const CI_LABEL: Record<CiStatus, string> = {
  passed: 'CI: 成功',
  failed: 'CI: 失敗',
  running: 'CI: 実行中',
  unknown: 'CI: 不明',
  skipped: 'CI: スキップ',
};

export function PrCiHumanSummaryPanel() {
  const lastQuery = loadLastQuery();
  const [repoUrl, setRepoUrl] = useState(lastQuery.repoUrl);
  const [prNumberInput, setPrNumberInput] = useState(lastQuery.prNumber);
  const [realResult, setRealResult] = useState<PrCiRealResult | null>(null);
  const [realLoading, setRealLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);

  const demoSnapshot = buildMockPrCiSnapshot(DEMO_SCENARIOS[activeScenario]?.snapshot);
  const demoSummary = translatePrCiToHuman(demoSnapshot);

  const realSnapshot = realResult?.ok
    ? healthToSnapshot(realResult.health, realResult.prNumber)
    : null;
  const realSummary = realSnapshot ? translatePrCiToHuman(realSnapshot) : null;

  async function handleFetch() {
    const prNum = parseInt(prNumberInput, 10);
    if (!repoUrl.trim() || isNaN(prNum)) return;
    saveLastQuery({ repoUrl: repoUrl.trim(), prNumber: prNumberInput });
    setRealLoading(true);
    const result = await fetchPrCiRealData(repoUrl.trim(), prNum);
    setRealResult(result);
    setRealLoading(false);
  }

  return (
    <section className="prCiHuman" aria-label="PR/CI人間向け要約">
      <span className="prCiHuman__eyebrow">Phase 95 · PR/CI状態</span>
      <h2 className="prCiHuman__title">PR/CI 要約</h2>

      <div className="prCiHuman__realSection">
        <div className="prCiHuman__realTitle">PR番号を入力して実データを確認</div>
        <div className="prCiHuman__realForm">
          <input
            className="prCiHuman__realInput"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
          />
          <input
            className="prCiHuman__realInput prCiHuman__realInput--small"
            value={prNumberInput}
            onChange={(e) => setPrNumberInput(e.target.value)}
            placeholder="PR番号"
            type="number"
            min="1"
          />
          <button
            type="button"
            className="prCiHuman__realBtn"
            onClick={() => { void handleFetch(); }}
            disabled={realLoading}
          >
            {realLoading ? '確認中…' : '確認する'}
          </button>
        </div>

        {realResult !== null && (
          realResult.ok ? (
            <div className={`prCiHuman__card prCiHuman__card--${realSummary?.level ?? 'neutral'} prCiHuman__card--real`}>
              <div className="prCiHuman__realBadge">実データ</div>
              <div className="prCiHuman__headline">{realSummary?.headline}</div>
              <div className="prCiHuman__subline">{realSummary?.subline}</div>
              <div className="prCiHuman__next">次にやること: {realSummary?.nextAction}</div>
              {realResult.summary ? (
                <div className="prCiHuman__realSummary">{realResult.summary}</div>
              ) : null}
            </div>
          ) : (
            <div className="prCiHuman__realError">読めませんでした: {realResult.error}</div>
          )
        )}
      </div>

      <details className="prCiHuman__demoSection">
        <summary className="prCiHuman__demoSummary">デモ（実データ未連携の場合）</summary>

        <div className={`prCiHuman__card prCiHuman__card--${demoSummary.level}`}>
          <div className="prCiHuman__headline">{demoSummary.headline}</div>
          <div className="prCiHuman__subline">{demoSummary.subline}</div>
          <div className="prCiHuman__next">次にやること: {demoSummary.nextAction}</div>
        </div>

        <div className="prCiHuman__details">
          <span className={`prCiHuman__chip ${CI_CHIP_CLASS[demoSnapshot.ciStatus]}`}>
            {CI_LABEL[demoSnapshot.ciStatus]}
          </span>
          <span
            className={`prCiHuman__chip ${
              demoSnapshot.reviewStatus === 'approved'
                ? 'prCiHuman__chip--review-approved'
                : demoSnapshot.reviewStatus === 'changes-requested'
                  ? 'prCiHuman__chip--review-requested'
                  : 'prCiHuman__chip--review-none'
            }`}
          >
            {demoSnapshot.reviewStatus === 'approved'
              ? 'レビュー: 承認'
              : demoSnapshot.reviewStatus === 'changes-requested'
                ? 'レビュー: 修正依頼'
                : 'レビュー: 待機中'}
          </span>
        </div>

        <div className="prCiHuman__demo">
          <span className="prCiHuman__demoLabel">シナリオを切り替えて確認</span>
          <div className="prCiHuman__demoRow">
            {DEMO_SCENARIOS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                className={`prCiHuman__demoBtn${i === activeScenario ? ' prCiHuman__demoBtn--active' : ''}`}
                onClick={() => setActiveScenario(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
