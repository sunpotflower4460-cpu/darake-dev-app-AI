import '../darakeMothershipV1.css';
import {
  buildMothershipReadiness,
  MOTHERSHIP_V1_FEATURES,
} from '../utils/darakeMothershipV1';

function navigateToGroup(group: string) {
  try {
    localStorage.setItem('darake.navGroup.v1', group);
    window.dispatchEvent(new StorageEvent('storage', { key: 'darake.navGroup.v1', newValue: group }));
  } catch {
    // ignore
  }
}

export function DarakeMothershipV1Panel() {
  const readiness = buildMothershipReadiness();

  return (
    <section className="mothership" aria-label="だらけ開発母艦 v1">
      <div>
        <span className="mothership__eyebrow">Phase 100 · v1 Complete</span>
        <h2 className="mothership__title">だらけ開発母艦</h2>
        <p className="mothership__subtitle">自分用GitHub管制母艦 — 作りたいものを置いたら、危ない判断だけ確認する</p>
      </div>

      <div className="mothership__quickActions">
        <button
          type="button"
          className="mothership__quickBtn mothership__quickBtn--settings"
          onClick={() => navigateToGroup('settings')}
        >
          🔧 初期設定する
        </button>
        <button
          type="button"
          className="mothership__quickBtn mothership__quickBtn--create"
          onClick={() => navigateToGroup('create')}
        >
          ✏️ 作りたいアプリを置く
        </button>
        <button
          type="button"
          className="mothership__quickBtn mothership__quickBtn--watch"
          onClick={() => navigateToGroup('watch')}
        >
          👀 進行中のPR/作業を見る
        </button>
      </div>

      {readiness.v1Complete ? (
        <span className="mothership__badge">v1 完成</span>
      ) : (
        <span className="mothership__badge" style={{ background: '#374151' }}>
          {readiness.doneCount}/{readiness.totalCount} 機能
        </span>
      )}

      <div className="mothership__progress">
        <div className="mothership__progressBar">
          <div
            className="mothership__progressFill"
            style={{ width: `${readiness.percent}%` }}
          />
        </div>
        <span className="mothership__progressLabel">{readiness.message}</span>
      </div>

      <ul className="mothership__features">
        {MOTHERSHIP_V1_FEATURES.map((f) => (
          <li key={f.id} className={`mothership__feature mothership__feature--${f.status}`}>
            <span className="mothership__featureDot" aria-hidden="true" />
            <div className="mothership__featureBody">
              <div className="mothership__featureLabel">{f.label}</div>
              <div className="mothership__featurePhase">{f.phase}</div>
            </div>
            <span className="mothership__featureDesc">{f.description}</span>
          </li>
        ))}
      </ul>

      {readiness.v1Complete ? (
        <div className="mothership__complete">
          <div className="mothership__completeTitle">v1 完成です</div>
          <p className="mothership__completeNote">
            初期設定・アイデア入力・Issue作成・Agent指示・PR確認・安全ゲート・App Store準備まで、一通りの開発サイクルがアプリ内で完結します。
          </p>
        </div>
      ) : null}

      <div className="mothership__vision">
        <div className="mothership__visionTitle">v1後の発展</div>
        <ul className="mothership__visionList">
          <li className="mothership__visionItem">v1.5: 複数アプリ管理（宝地図・メモ・音楽・研究）</li>
          <li className="mothership__visionItem">v2: テンプレート母艦化（アプリ種別に最適なテンプレ）</li>
          <li className="mothership__visionItem">v3: AI工房OS化（アイデア → 完成まで全自動）</li>
        </ul>
      </div>
    </section>
  );
}
