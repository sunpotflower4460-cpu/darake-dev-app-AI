import { useState } from 'react';
import '../prCiHumanSummary.css';
import {
  buildMockPrCiSnapshot,
  translatePrCiToHuman,
  type CiStatus,
  type PrCiSnapshot,
} from '../utils/prCiHumanTranslator';

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
  const [activeScenario, setActiveScenario] = useState(0);
  const snapshot = buildMockPrCiSnapshot(DEMO_SCENARIOS[activeScenario]?.snapshot);
  const summary = translatePrCiToHuman(snapshot);

  return (
    <section className="prCiHuman" aria-label="PR/CI人間向け要約">
      <span className="prCiHuman__eyebrow">Phase 95 · デモ（実データ未連携）</span>
      <h2 className="prCiHuman__title">PR/CI 要約デモ</h2>

      <div className={`prCiHuman__card prCiHuman__card--${summary.level}`}>
        <div className="prCiHuman__headline">{summary.headline}</div>
        <div className="prCiHuman__subline">{summary.subline}</div>
        <div className="prCiHuman__next">次にやること: {summary.nextAction}</div>
      </div>

      <div className="prCiHuman__details">
        <span className={`prCiHuman__chip ${CI_CHIP_CLASS[snapshot.ciStatus]}`}>
          {CI_LABEL[snapshot.ciStatus]}
        </span>
        <span
          className={`prCiHuman__chip ${
            snapshot.reviewStatus === 'approved'
              ? 'prCiHuman__chip--review-approved'
              : snapshot.reviewStatus === 'changes-requested'
                ? 'prCiHuman__chip--review-requested'
                : 'prCiHuman__chip--review-none'
          }`}
        >
          {snapshot.reviewStatus === 'approved'
            ? 'レビュー: 承認'
            : snapshot.reviewStatus === 'changes-requested'
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
    </section>
  );
}
