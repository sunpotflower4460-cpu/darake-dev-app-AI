import { useState, useCallback } from 'react';
import type { SettingsHealthResponse, SettingsHealthSummary, SettingsHealthItem } from '../utils/settingsHealth';
import { buildSettingsHealthSummary } from '../utils/buildSettingsHealthSummary';
import { calculateReadyScore, READY_SCORE_LABELS } from '../utils/calculateReadyScore';
import { buildCloudflareSetupGuide } from '../utils/buildCloudflareSetupGuide';
import { buildSetupGuidanceFromHealth } from '../utils/buildSetupGuidance';
import { SetupGuidanceCard } from './SetupGuidanceCard';
import type { SetupGuidance } from '../utils/setupGuidance';

type CheckStatus = 'idle' | 'loading' | 'done' | 'error';

async function fetchSettingsHealth(): Promise<SettingsHealthResponse> {
  const res = await fetch('/api/darake/settings/health', { method: 'POST' });
  const data = (await res.json()) as SettingsHealthResponse;
  if (!data.ok) throw new Error('health check failed');
  return data;
}

async function testNotificationChannel(channel: 'telegram' | 'webhook'): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('/api/darake/notifications/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel }),
  });
  return res.json() as Promise<{ ok: boolean; error?: string }>;
}

function levelIcon(level: SettingsHealthItem['level']): string {
  switch (level) {
    case 'ok': return '✅';
    case 'missing': return '⚠️';
    case 'warning': return '💡';
    case 'blocked': return '❌';
  }
}

function OverallBanner({ summary }: { summary: SettingsHealthSummary }) {
  const { score, label } = calculateReadyScore(
    summary.readyCount,
    summary.missingCount,
    summary.blockedCount,
  );
  const labelText = READY_SCORE_LABELS[label];

  const missingOnly = summary.items.filter(
    (i) => i.level === 'missing' || i.level === 'blocked',
  );

  return (
    <div className={`shc-banner shc-banner--${summary.overall}`}>
      <div className="shc-banner-score">{score}</div>
      <div className="shc-banner-label">{labelText}</div>
      {missingOnly.length === 0 && (
        <div className="shc-banner-sub">今やること：アプリを作り始められます</div>
      )}
      {missingOnly.length === 1 && (
        <div className="shc-banner-sub">
          あと1つだけ必要です
          <br />
          <span className="shc-banner-missing">{missingOnly[0].description}</span>
        </div>
      )}
      {missingOnly.length > 1 && (
        <div className="shc-banner-sub">
          あと{missingOnly.length}つの設定が必要です
        </div>
      )}
    </div>
  );
}

function ItemRow({ item }: { item: SettingsHealthItem }) {
  const isMissing = item.level === 'missing' || item.level === 'blocked';
  return (
    <div className={`shc-item shc-item--${item.level}`}>
      <span className="shc-item-icon">{levelIcon(item.level)}</span>
      <div className="shc-item-body">
        <div className="shc-item-title">{item.title}</div>
        {isMissing && (
          <>
            <div className="shc-item-desc">{item.description}</div>
            {item.nextActionLabel && (
              <div className="shc-item-next">次にやること：{item.nextActionLabel}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SetupGuideSection({ summary }: { summary: SettingsHealthSummary }) {
  const guide = buildCloudflareSetupGuide(summary);
  return (
    <div className="shc-guide">
      <pre className="shc-guide-pre">{guide}</pre>
    </div>
  );
}

function TestButtonsSection() {
  const [telegramResult, setTelegramResult] = useState<string | null>(null);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTelegram = useCallback(async () => {
    setLoading(true);
    setTelegramResult(null);
    try {
      const res = await testNotificationChannel('telegram');
      setTelegramResult(res.ok ? '✅ Telegram通知を送信しました' : `❌ ${res.error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleWebhook = useCallback(async () => {
    setLoading(true);
    setWebhookResult(null);
    try {
      const res = await testNotificationChannel('webhook');
      setWebhookResult(res.ok ? '✅ Webhook通知を送信しました' : `❌ ${res.error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="shc-test-btns">
      <div className="shc-test-row">
        <button
          type="button"
          className="shc-btn-secondary"
          onClick={handleTelegram}
          disabled={loading}
        >
          通知確認（Telegram）
        </button>
        {telegramResult && <span className="shc-test-result">{telegramResult}</span>}
      </div>
      <div className="shc-test-row">
        <button
          type="button"
          className="shc-btn-secondary"
          onClick={handleWebhook}
          disabled={loading}
        >
          通知確認（Webhook）
        </button>
        {webhookResult && <span className="shc-test-result">{webhookResult}</span>}
      </div>
    </div>
  );
}

export function SettingsHealthCenter() {
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [summary, setSummary] = useState<SettingsHealthSummary | null>(null);
  const [guidance, setGuidance] = useState<SetupGuidance[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showGuidanceCards, setShowGuidanceCards] = useState(false);

  const handleCheck = useCallback(async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      const data = await fetchSettingsHealth();
      const built = buildSettingsHealthSummary(data);
      setSummary(built);
      setGuidance(buildSetupGuidanceFromHealth(data));
      setStatus('done');
    } catch {
      setErrorMsg('設定の確認に失敗しました。Workerへの接続を確認してください。');
      setStatus('error');
    }
  }, []);

  const missingItems = summary?.items.filter(
    (i) => i.level === 'missing' || i.level === 'blocked',
  ) ?? [];

  return (
    <div className="shc-card">
      <div className="shc-header">
        <span className="shc-title">設定チェックセンター</span>
        <span className="shc-badge">Phase 54</span>
      </div>

      {status === 'idle' && (
        <div className="shc-idle">
          <div className="shc-idle-desc">
            Cloudflare / GitHub / KV / 通知の設定状態を確認します。
            <br />
            不足している設定だけを表示します。
          </div>
          <button type="button" className="shc-btn-primary" onClick={handleCheck}>
            GitHub確認 / 設定をチェック
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="shc-loading">確認中...</div>
      )}

      {status === 'error' && (
        <div className="shc-error">
          <div className="shc-error-msg">{errorMsg}</div>
          <button type="button" className="shc-btn-primary" onClick={handleCheck}>
            再試行
          </button>
        </div>
      )}

      {status === 'done' && summary && (
        <>
          <OverallBanner summary={summary} />

          <div className="shc-actions">
            {missingItems.length > 0 && (
              <>
                <button
                  type="button"
                  className="shc-btn-text"
                  onClick={() => setShowGuidanceCards((v) => !v)}
                >
                  {showGuidanceCards ? '次にやることを閉じる' : '次にやることを見る'}
                </button>
                <button
                  type="button"
                  className="shc-btn-text"
                  onClick={() => setShowDetails((v) => !v)}
                >
                  {showDetails ? '不足設定を閉じる' : '不足設定を見る'}
                </button>
              </>
            )}
            <button
              type="button"
              className="shc-btn-text"
              onClick={handleCheck}
            >
              再確認
            </button>
          </div>

          {showGuidanceCards && guidance.length > 0 && (
            <div className="shc-details">
              <div className="shc-section-label sgc-list-label">次にやること</div>
              <div className="sgc-list">
                {guidance.map((g) => (
                  <SetupGuidanceCard key={g.kind} guidance={g} />
                ))}
              </div>
            </div>
          )}

          {showDetails && (
            <div className="shc-details">
              <div className="shc-section-label">不足している設定</div>
              {missingItems.length === 0 ? (
                <div className="shc-all-ok">不足している設定はありません</div>
              ) : (
                missingItems.map((item) => <ItemRow key={item.id} item={item} />)
              )}

              <div className="shc-section-label shc-section-label--mt">OK項目</div>
              {summary.items
                .filter((i) => i.level === 'ok' || i.level === 'warning')
                .map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}

              <button
                type="button"
                className="shc-btn-text shc-btn-text--mt"
                onClick={() => setShowGuide((v) => !v)}
              >
                {showGuide ? 'Cloudflare設定ガイドを閉じる' : 'Cloudflare設定ガイドを見る'}
              </button>

              {showGuide && <SetupGuideSection summary={summary} />}

              <div className="shc-section-label shc-section-label--mt">通知テスト</div>
              <TestButtonsSection />
            </div>
          )}

          {missingItems.length === 0 && (
            <div className="shc-detail-btn-row">
              <button
                type="button"
                className="shc-btn-text"
                onClick={() => setShowDetails((v) => !v)}
              >
                {showDetails ? '詳細を閉じる' : '詳細を見る'}
              </button>
              {showDetails && (
                <div className="shc-details">
                  {summary.items.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                  <div className="shc-section-label shc-section-label--mt">通知テスト</div>
                  <TestButtonsSection />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
