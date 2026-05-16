import { useState } from 'react';
import '../appStorePrepMode.css';
import {
  APP_STORE_PREP_ITEMS,
  buildAppStorePrepReadiness,
  loadAppStorePrepState,
  saveAppStorePrepState,
} from '../utils/appStorePrepMode';

export function AppStorePrepModePanel() {
  const stored = loadAppStorePrepState();
  const [checkedIds, setCheckedIds] = useState<string[]>(stored?.checkedIds ?? []);
  const [showGate, setShowGate] = useState(false);

  function toggle(id: string) {
    setCheckedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveAppStorePrepState({
        checkedIds: next,
        appName: stored?.appName ?? '',
        updatedAt: new Date().toISOString(),
      });
      return next;
    });
  }

  const readiness = buildAppStorePrepReadiness(checkedIds);

  return (
    <section className="appStorePrep" aria-label="App Store提出準備モード">
      <span className="appStorePrep__eyebrow">Phase 99 · App Store提出準備</span>
      <h2 className="appStorePrep__title">提出前チェックリスト</h2>

      <div className="appStorePrep__progress">
        <div className="appStorePrep__progressBar">
          <div
            className="appStorePrep__progressFill"
            style={{ width: `${readiness.percent}%` }}
          />
        </div>
        <span className="appStorePrep__progressLabel">
          {checkedIds.length} / {APP_STORE_PREP_ITEMS.length} 完了
          {' — '}必須: {readiness.requiredDone}/{readiness.requiredTotal}
        </span>
      </div>

      <ul className="appStorePrep__list">
        {APP_STORE_PREP_ITEMS.map((item) => {
          const checked = checkedIds.includes(item.id);
          return (
            <li
              key={item.id}
              className={`appStorePrep__item${checked ? ' appStorePrep__item--checked' : ''}`}
              onClick={() => toggle(item.id)}
              role="checkbox"
              aria-checked={checked}
              tabIndex={0}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggle(item.id)}
            >
              <div className="appStorePrep__checkbox">{checked ? '✓' : ''}</div>
              <div className="appStorePrep__itemBody">
                <div className="appStorePrep__itemLabel">
                  {item.label}
                  {item.required ? (
                    <span className="appStorePrep__required">必須</span>
                  ) : null}
                  {item.humanMustCheck ? (
                    <span className="appStorePrep__humanBadge">人間確認</span>
                  ) : null}
                </div>
                <div className="appStorePrep__itemHint">{item.hint}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={`appStorePrep__gate${readiness.readyForSubmit ? ' appStorePrep__gate--ready' : ''}`}>
        <div className="appStorePrep__gateTitle">
          {readiness.readyForSubmit ? '提出準備が整いました' : 'ここから先はApp Store提出です'}
        </div>
        <p className="appStorePrep__gateNote">
          {readiness.readyForSubmit
            ? '必須項目と人間確認がすべて完了しています。App Store Connectから提出できます。'
            : `必須項目 ${readiness.requiredTotal - readiness.requiredDone} 件、人間確認 ${readiness.humanCheckTotal - readiness.humanCheckDone} 件が残っています。送信前に必ず全項目を確認してください。`}
        </p>
        <button
          type="button"
          className={`appStorePrep__submitGate${readiness.readyForSubmit ? ' appStorePrep__submitGate--ready' : ''}`}
          onClick={() => readiness.readyForSubmit && setShowGate(true)}
          disabled={!readiness.readyForSubmit}
        >
          {readiness.readyForSubmit ? '送信してよいですか？（確認）' : '未完了の項目があります'}
        </button>
        {showGate && readiness.readyForSubmit ? (
          <p style={{ fontSize: 13, color: '#374151' }}>
            App Store Connectから最終送信してください。このアプリは送信しません。
          </p>
        ) : null}
      </div>
    </section>
  );
}
