import { useMemo, useState } from 'react';
import '../prCiHumanSummary.css';
import { DarakePanelBadge } from './DarakePanelBadge';
import {
  buildDarakeWorkSession,
  loadCurrentWorkSession,
  parseGitHubPrInput,
  saveCurrentWorkSession,
} from '../utils/darakeWorkSession';
import {
  buildMockPrCiSnapshot,
  translatePrCiToHuman,
  type CiStatus,
  type PrCiSnapshot,
  type ReviewStatus,
} from '../utils/prCiHumanTranslator';
import {
  buildGitHubPrUrl,
  fetchPrCiStatus,
  loadPrCiLastQuery,
  savePrCiLastStatus,
  savePrCiLastQuery,
  type RealPrCiStatus,
} from '../utils/prCiStatusClient';

const DEFAULT_REPO_URL = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI';

const DEMO_SCENARIOS: { label: string; snapshot: Partial<PrCiSnapshot> }[] = [
  { label: 'CI成功', snapshot: { ciStatus: 'passed', mergeReadiness: 'ready' } },
  { label: 'CI失敗', snapshot: { ciStatus: 'failed', mergeReadiness: 'not-ready' } },
  { label: 'CI実行中', snapshot: { ciStatus: 'running', mergeReadiness: 'not-ready' } },
  {
    label: '修正依頼',
    snapshot: { ciStatus: 'passed', reviewStatus: 'changes-requested', mergeReadiness: 'not-ready' },
  },
  { label: 'コンフリクト', snapshot: { ciStatus: 'passed', mergeReadiness: 'blocked' } },
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

const REVIEW_CLASS: Record<RealPrCiStatus['reviewStatus'], string> = {
  approved: 'prCiHuman__chip--review-approved',
  'changes-requested': 'prCiHuman__chip--review-requested',
  pending: 'prCiHuman__chip--review-none',
  none: 'prCiHuman__chip--review-none',
  unknown: 'prCiHuman__chip--review-none',
};

const REVIEW_LABEL: Record<RealPrCiStatus['reviewStatus'], string> = {
  approved: 'レビュー: 承認',
  'changes-requested': 'レビュー: 修正依頼',
  pending: 'レビュー: 待機中',
  none: 'レビュー: なし',
  unknown: 'レビュー: 不明',
};

const MERGE_CLASS: Record<RealPrCiStatus['mergeReadiness'], string> = {
  ready: 'prCiHuman__chip--merge-ready',
  'not-ready': 'prCiHuman__chip--merge-not-ready',
  merged: 'prCiHuman__chip--merge-merged',
  conflict: 'prCiHuman__chip--merge-conflict',
  unknown: 'prCiHuman__chip--merge-unknown',
};

const MERGE_LABEL: Record<RealPrCiStatus['mergeReadiness'], string> = {
  ready: 'マージ: 可能',
  'not-ready': 'マージ: 未準備',
  merged: 'マージ: 済み',
  conflict: 'マージ: コンフリクト',
  unknown: 'マージ: 不明',
};

function formatHeadSha(headSha: string | null): string {
  return headSha ? headSha.slice(0, 7) : '---';
}

function normalizeRepoUrl(value: string): string {
  return value.trim() || DEFAULT_REPO_URL;
}

function sanitizeGitHubPrUrl(url: string | null): string | null {
  return url && /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/?$/i.test(url) ? url : null;
}

function realStatusToSnapshot(status: RealPrCiStatus): PrCiSnapshot {
  return buildMockPrCiSnapshot({
    prNumber: status.prNumber ?? 0,
    ciStatus: status.ciStatus,
    reviewStatus: status.reviewStatus === 'unknown' ? 'none' : status.reviewStatus,
    mergeReadiness:
      status.mergeReadiness === 'conflict'
        ? 'blocked'
        : status.mergeReadiness === 'unknown'
          ? 'unknown'
          : status.mergeReadiness,
  });
}

export function PrCiHumanSummaryPanel() {
  const session = loadCurrentWorkSession();
  const lastQuery = loadPrCiLastQuery();
  const initialPrInput =
    session?.prUrl || (session?.prNumber ? String(session.prNumber) : lastQuery.prNumber);
  const [repoUrl, setRepoUrl] = useState(normalizeRepoUrl(session?.repoUrl || lastQuery.repoUrl));
  const [prInput, setPrInput] = useState(initialPrInput);
  const [realStatus, setRealStatus] = useState<RealPrCiStatus | null>(null);
  const [realLoading, setRealLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  const demoSnapshot = buildMockPrCiSnapshot(DEMO_SCENARIOS[activeScenario]?.snapshot);
  const demoSummary = translatePrCiToHuman(demoSnapshot);
  const realSummary = useMemo(
    () => (realStatus?.mode === 'real' ? translatePrCiToHuman(realStatusToSnapshot(realStatus)) : null),
    [realStatus],
  );
  const parsedPrInput = parseGitHubPrInput(prInput, repoUrl);
  const safeRealPrUrl = sanitizeGitHubPrUrl(realStatus?.prUrl ?? null);
  const savedPrUrl = sanitizeGitHubPrUrl(
    parsedPrInput.prUrl || buildGitHubPrUrl(repoUrl, parsedPrInput.prNumber ?? 0),
  );

  function savePrReference() {
    if (!parsedPrInput.prNumber && !parsedPrInput.prUrl) {
      setSaveMessage('PR URL または PR番号を入れてください');
      return;
    }
    const normalizedRepoUrl = normalizeRepoUrl(parsedPrInput.repoUrl || repoUrl);
    savePrCiLastQuery({
      repoUrl: normalizedRepoUrl,
      prNumber: parsedPrInput.prNumber ? String(parsedPrInput.prNumber) : '',
    });
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...(loadCurrentWorkSession() ?? {}),
        appName: session?.appName || '新しいアプリ',
        oneLineIdea: session?.oneLineIdea || 'アイデアを整理する',
        repoUrl: normalizedRepoUrl,
        issueUrl: session?.issueUrl ?? null,
        issueNumber: session?.issueNumber ?? null,
        prUrl: parsedPrInput.prUrl,
        prNumber: parsedPrInput.prNumber,
        previewUrl: session?.previewUrl ?? null,
        currentPhaseTitle: session?.currentPhaseTitle ?? null,
        currentInstruction: session?.currentInstruction ?? null,
        status: 'pr-detected',
        nextActionLabel: 'CIを確認する',
      }),
    );
    setRepoUrl(normalizedRepoUrl);
    setPrInput(parsedPrInput.prUrl || (parsedPrInput.prNumber ? String(parsedPrInput.prNumber) : prInput));
    setSaveMessage('WorkSessionにPRを保存しました');
  }

  function handleFetchClick() {
    void handleFetch();
  }

  async function handleFetch() {
    const prNum = parsedPrInput.prNumber ?? Number.parseInt(prInput, 10);
    const nextRepoUrl = normalizeRepoUrl(parsedPrInput.repoUrl || repoUrl);

    savePrCiLastQuery({ repoUrl: nextRepoUrl, prNumber: prNum > 0 ? String(prNum) : '' });
    setRealLoading(true);
    const result = await fetchPrCiStatus(nextRepoUrl, prNum);
    savePrCiLastStatus(result);
    setRealStatus(result);
    setRealLoading(false);
    const currentSession = loadCurrentWorkSession();
    if (!currentSession) return;
    const nextStatus =
      result.mode === 'real' && (result.ciStatus === 'failed' || result.mergeReadiness === 'conflict')
        ? 'review-needed'
        : result.mode === 'real' && result.ciStatus === 'passed' && currentSession.previewUrl
          ? 'preview-ready'
          : 'ci-checking';
    const nextActionLabel =
      nextStatus === 'review-needed'
        ? '人間確認する'
        : result.mode === 'real' && result.ciStatus === 'passed' && currentSession.previewUrl
          ? 'Previewを見る'
          : result.mode === 'real' && result.ciStatus === 'passed'
            ? 'Preview URLを探す'
            : 'CIを確認する';
    const effectivePrNumber = result.prNumber ?? parsedPrInput.prNumber ?? currentSession.prNumber;
    const effectivePrUrl =
      sanitizeGitHubPrUrl(result.prUrl) ??
      (effectivePrNumber ? buildGitHubPrUrl(nextRepoUrl, effectivePrNumber) : null) ??
      currentSession.prUrl;
    saveCurrentWorkSession(
      buildDarakeWorkSession({
        ...currentSession,
        repoUrl: nextRepoUrl,
        prUrl: effectivePrUrl,
        prNumber: effectivePrNumber,
        status: nextStatus,
        nextActionLabel,
      }),
    );
  }

  return (
    <section className="prCiHuman" aria-label="PR/CI人間向け要約">
      <DarakePanelBadge kinds={['real-data', 'demo']} />
      <span className="prCiHuman__eyebrow">Phase 103 · 実データ / デモ安全フォールバック</span>
      <h2 className="prCiHuman__title">PR/CI 要約</h2>

      <div className="prCiHuman__realSection">
        <div className="prCiHuman__sectionLabel">実データ取得</div>
        <div className="prCiHuman__repoHint">対象Repo: {repoUrl || DEFAULT_REPO_URL}</div>
        <div className="prCiHuman__realForm">
          <label className="prCiHuman__fieldLabel" htmlFor="pr-ci-number">
            PR URL または PR番号
            <input
              id="pr-ci-number"
              className="prCiHuman__realInput prCiHuman__realInput--small"
              value={prInput}
              onChange={(event) => setPrInput(event.target.value)}
              placeholder="https://github.com/owner/repo/pull/185 または 185"
            />
          </label>
          <button type="button" className="prCiHuman__realBtn" onClick={savePrReference}>
            保存
          </button>
          <button
            type="button"
            className="prCiHuman__realBtn"
            onClick={handleFetchClick}
            disabled={realLoading}
          >
            {realLoading ? '取得中…' : '状態を取得する'}
          </button>
        </div>
        {saveMessage ? <div className="prCiHuman__realSummary">{saveMessage}</div> : null}

        <details className="prCiHuman__repoDetails">
          <summary>リポジトリURLを変更</summary>
          <input
            className="prCiHuman__realInput"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder={DEFAULT_REPO_URL}
          />
        </details>
      </div>

      <div className="prCiHuman__resultSection">
        <div className="prCiHuman__sectionLabel">取得結果</div>
        {realStatus ? (
          realStatus.mode === 'real' && realSummary ? (
            <div className={`prCiHuman__card prCiHuman__card--${realSummary.level} prCiHuman__card--real`}>
              <div className="prCiHuman__realBadge">実データ</div>
              <div className="prCiHuman__headline">{realSummary.headline}</div>
              <div className="prCiHuman__subline">{realSummary.subline}</div>
              {realStatus.message && realStatus.message !== realSummary.headline ? (
                <div className="prCiHuman__realSummary">{realStatus.message}</div>
              ) : null}
              <div className="prCiHuman__next">次にやること: {realSummary.nextAction}</div>
              <div className="prCiHuman__details">
                <span className={`prCiHuman__chip ${CI_CHIP_CLASS[realStatus.ciStatus]}`}>
                  {CI_LABEL[realStatus.ciStatus]}
                </span>
                <span className={`prCiHuman__chip ${REVIEW_CLASS[realStatus.reviewStatus]}`}>
                  {REVIEW_LABEL[realStatus.reviewStatus]}
                </span>
                <span className={`prCiHuman__chip ${MERGE_CLASS[realStatus.mergeReadiness]}`}>
                  {MERGE_LABEL[realStatus.mergeReadiness]}
                </span>
                <span className="prCiHuman__chip prCiHuman__chip--sha">HEAD: {formatHeadSha(realStatus.headSha)}</span>
              </div>
              <div className="prCiHuman__meta">
                {safeRealPrUrl ? (
                  <a href={safeRealPrUrl} target="_blank" rel="noreferrer" className="prCiHuman__link">
                    PRを開く
                  </a>
                ) : savedPrUrl ? (
                  <a href={savedPrUrl} target="_blank" rel="noreferrer" className="prCiHuman__link">
                    PRを開く
                  </a>
                ) : null}
              </div>
            </div>
          ) : realStatus.mode === 'unavailable' ? (
            <div className="prCiHuman__card prCiHuman__card--neutral prCiHuman__card--real">
              <div className="prCiHuman__realBadge">実データ</div>
              <div className="prCiHuman__headline">実データ取得はまだ未接続です。</div>
              <div className="prCiHuman__subline">デモ表示で確認できます。</div>
              {realStatus.message ? <div className="prCiHuman__realSummary">{realStatus.message}</div> : null}
            </div>
          ) : (
            <div className="prCiHuman__card prCiHuman__card--neutral prCiHuman__card--real">
              <div className="prCiHuman__realBadge">実データ</div>
              <div className="prCiHuman__headline">
                PR状態を取得できませんでした。PR番号やGitHub連携を確認してください。
              </div>
              {realStatus.message ? <div className="prCiHuman__realSummary">{realStatus.message}</div> : null}
            </div>
          )
        ) : (
          <div className="prCiHuman__realSummary">
            PR URL または PR番号を入れると、CI状態 / レビュー状態 / マージ可否 / 最新commitを確認できます。
          </div>
        )}
      </div>

      <details className="prCiHuman__demoSection">
        <summary className="prCiHuman__demoSummary">デモ表示</summary>

        <div className="prCiHuman__demoInner">
          <div className={`prCiHuman__card prCiHuman__card--${demoSummary.level}`}>
            <div className="prCiHuman__demoBadge">デモ</div>
            <div className="prCiHuman__headline">{demoSummary.headline}</div>
            <div className="prCiHuman__subline">{demoSummary.subline}</div>
            <div className="prCiHuman__next">次にやること: {demoSummary.nextAction}</div>
          </div>

          <div className="prCiHuman__details">
            <span className={`prCiHuman__chip ${CI_CHIP_CLASS[demoSnapshot.ciStatus]}`}>
              {CI_LABEL[demoSnapshot.ciStatus]}
            </span>
            <span className={`prCiHuman__chip ${REVIEW_CLASS[demoSnapshot.reviewStatus]}`}>
              {REVIEW_LABEL[demoSnapshot.reviewStatus]}
            </span>
          </div>

          <div className="prCiHuman__demo">
            <span className="prCiHuman__demoLabel">シナリオを切り替えて確認</span>
            <div className="prCiHuman__demoRow">
              {DEMO_SCENARIOS.map((scenario, index) => (
                <button
                  key={scenario.label}
                  type="button"
                  className={`prCiHuman__demoBtn${index === activeScenario ? ' prCiHuman__demoBtn--active' : ''}`}
                  onClick={() => setActiveScenario(index)}
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}
