import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  loadHealthCheckResult,
  saveHealthCheckResult,
  isHealthCheckStale,
} from '../utils/darakeHealthCheck';
import type { DarakeHealthCheckResult, DarakeHealthItem } from '../utils/darakeHealthCheck';
import { fetchDarakeHealth } from '../utils/darakeHealthCheckClient';
import { loadDarakeLevelSettings } from '../utils/darakeLevelSettings';

function itemIcon(status: DarakeHealthItem['status']): string {
  if (status === 'ok') return '✅';
  if (status === 'warning') return '⚠️';
  return '⬜';
}

function overallBadgeClass(overall: DarakeHealthCheckResult['overall']): string {
  switch (overall) {
    case 'ready': return 'darakeHealth__badge--ready';
    case 'mostly-ready': return 'darakeHealth__badge--mostly-ready';
    case 'partial': return 'darakeHealth__badge--partial';
    case 'blocked': return 'darakeHealth__badge--blocked';
    default: return 'darakeHealth__badge--unknown';
  }
}

function overallCardClass(overall: DarakeHealthCheckResult['overall']): string {
  switch (overall) {
    case 'ready': return 'darakeHealth--ready';
    case 'mostly-ready': return 'darakeHealth--mostly-ready';
    case 'partial': return 'darakeHealth--partial';
    case 'blocked': return 'darakeHealth--blocked';
    default: return '';
  }
}

function overallBadgeLabel(overall: DarakeHealthCheckResult['overall']): string {
  switch (overall) {
    case 'ready': return '準備OK';
    case 'mostly-ready': return 'ほぼ準備OK';
    case 'partial': return '一部可能';
    case 'blocked': return '設定が必要';
    default: return '不明';
  }
}

export function DarakeHealthCheckPanel() {
  const [result, setResult] = useState<DarakeHealthCheckResult | null>(() =>
    loadHealthCheckResult(),
  );
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);

  const levelSettings = useMemo(() => loadDarakeLevelSettings(), []);
  const isCareful = levelSettings.level === 'careful';
  const isWakeMeOnly = levelSettings.level === 'wake-me-only-if-needed';

  // careful mode: show items by default
  useEffect(() => {
    if (isCareful) setShowItems(true);
  }, [isCareful]);

  const isStale = result ? isHealthCheckStale(result.checkedAt) : false;

  async function handleCheck() {
    setIsChecking(true);
    setError(null);
    try {
      const fetched = await fetchDarakeHealth();
      setResult(fetched);
      saveHealthCheckResult(fetched);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '診断に失敗しました。Workerに接続できません。',
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div
      className={`darakeHealth ${result ? overallCardClass(result.overall) : ''}`}
    >
      <div className="darakeHealth__header">
        <span className="darakeHealth__title">だらけ診断</span>
        {result && (
          <>
            <span
              className={`darakeHealth__badge ${overallBadgeClass(result.overall)}`}
            >
              {overallBadgeLabel(result.overall)}
            </span>
            <span className="darakeHealth__score">
              <span className="darakeHealth__scoreValue">{result.readinessScore}</span>%
            </span>
          </>
        )}
      </div>

      {result && isStale && (
        <div className="darakeHealth__stale">
          ※ この診断結果は古い可能性があります（30分以上前）
        </div>
      )}

      {result && (
        <div className="darakeHealth__message">
          {result.userMessage}
        </div>
      )}

      {result && !isWakeMeOnly && result.overall !== 'ready' && (
        <div className="darakeHealth__nextAction">
          <div className="darakeHealth__nextActionLabel">次にやること</div>
          <div className="darakeHealth__nextActionText">
            {result.nextActionLabel}
          </div>
        </div>
      )}

      <button
        type="button"
        className="darakeHealth__checkBtn"
        onClick={handleCheck}
        disabled={isChecking}
      >
        {isChecking ? '診断中...' : '今の設定を診断する'}
      </button>

      {error && <div className="darakeHealth__error">❌ {error}</div>}

      {result && !(isWakeMeOnly && (result.overall === 'ready' || result.overall === 'mostly-ready')) && (
        <>
          <button
            type="button"
            className="darakeHealth__toggleBtn"
            onClick={() => setShowItems((v) => !v)}
          >
            {showItems ? (
              <>
                <ChevronUp size={13} /> 詳細を閉じる
              </>
            ) : (
              <>
                <ChevronDown size={13} /> 詳細を見る
              </>
            )}
          </button>

          {showItems && (
            <div className="darakeHealth__items">
              {result.items.map((item) => (
                <div
                  key={item.id}
                  className={`darakeHealth__item darakeHealth__item--${item.status}`}
                >
                  <span className="darakeHealth__itemIcon">
                    {itemIcon(item.status)}
                  </span>
                  <div className="darakeHealth__itemBody">
                    <div className="darakeHealth__itemLabel">{item.label}</div>
                    {item.status !== 'ok' && (
                      <div className="darakeHealth__itemMessage">
                        {item.userMessage}
                      </div>
                    )}
                    {item.nextAction && (
                      <div className="darakeHealth__itemNext">
                        → {item.nextAction}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {result && (
        <div className="darakeHealth__checkedAt">
          診断日時：{new Date(result.checkedAt).toLocaleString('ja-JP')}
        </div>
      )}
    </div>
  );
}
